-- =====================================================================
--  Mairie de Port-Gentil · Base de données Supabase
--  À exécuter UNE FOIS dans : Supabase > SQL Editor > New query > Run
--  Modèle : une table « records » (rubrique + arrondissement + contenu JSON),
--  des profils d'agents avec rôle et périmètre, des règles de sécurité (RLS).
-- =====================================================================
create extension if not exists pgcrypto with schema extensions;

-- ---------------------------------------------------------------------
-- 1. Tables
-- ---------------------------------------------------------------------
create table if not exists public.profiles (
  id     uuid primary key references auth.users on delete cascade,
  role   text not null check (role in ('maire','sg','etatcivil','technique','finances','rh','arrondissement')),
  arr    int  not null default 0 check (arr between 0 and 4),   -- 0 = toute la commune
  login  text not null unique,
  prenom text not null,
  nom    text not null,
  titre  text
);

create table if not exists public.records (
  id         text primary key,
  col        text not null check (col in ('demandes','signalements','actes','agenda','recettes','agents','stocks','chantiers','publications','contacts','journal')),
  arr        int  not null default 0 check (arr between 0 and 4),
  data       jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);
create index if not exists records_col_idx on public.records (col, created_at desc);
create index if not exists records_ref_idx on public.records ((data->>'ref'));

create sequence if not exists public.demande_seq start 1;
create sequence if not exists public.signal_seq start 1;

-- ---------------------------------------------------------------------
-- 2. Droits : quel rôle voit quelle rubrique
-- ---------------------------------------------------------------------
create or replace function public.me() returns public.profiles
language sql stable security definer set search_path = public as $$ select * from profiles where id = auth.uid() $$;

create or replace function public.can_col(p_col text, p_arr int) returns boolean
language plpgsql stable security definer set search_path = public as $$
declare p profiles;
begin
  select * into p from profiles where id = auth.uid();
  if p.id is null then return false; end if;
  if p.role in ('maire','sg') then return true; end if;
  if p.arr <> 0 and p_arr <> p.arr then return false; end if;      -- un arrondissement ne voit que le sien
  return case p.role
    when 'etatcivil'      then p_col in ('demandes','actes','stocks','journal')
    when 'technique'      then p_col in ('signalements','chantiers','stocks','journal')
    when 'finances'       then p_col in ('recettes','chantiers','journal')
    when 'rh'             then p_col in ('agents','journal')
    when 'arrondissement' then p_col in ('demandes','signalements','actes','agenda','recettes','chantiers','stocks','publications','contacts','journal')
    else false end;
end $$;

alter table public.profiles enable row level security;
alter table public.records  enable row level security;

drop policy if exists "profils lisibles par les agents" on public.profiles;
create policy "profils lisibles par les agents" on public.profiles for select to authenticated using (true);

drop policy if exists "lecture selon le rôle" on public.records;
create policy "lecture selon le rôle" on public.records for select to authenticated using (can_col(col, arr));
drop policy if exists "création selon le rôle" on public.records;
create policy "création selon le rôle" on public.records for insert to authenticated with check (can_col(col, arr) or col = 'journal');
drop policy if exists "modification selon le rôle" on public.records;
create policy "modification selon le rôle" on public.records for update to authenticated using (can_col(col, arr) and col <> 'journal') with check (can_col(col, arr));
drop policy if exists "suppression selon le rôle" on public.records;
create policy "suppression selon le rôle" on public.records for delete to authenticated using (can_col(col, arr) and col <> 'journal');

-- ---------------------------------------------------------------------
-- 3. Fonctions publiques (site) : dépôt, suivi, publications
-- ---------------------------------------------------------------------
create or replace function public.submit_public(p_col text, p_arr int, p_data jsonb) returns text
language plpgsql security definer set search_path = public as $$
declare ref text; yr text := to_char(now(), 'YY'); first text; d jsonb;
begin
  if p_col not in ('demandes','signalements','contacts') then raise exception 'Rubrique non autorisée'; end if;
  if length(p_data::text) > 4500000 then raise exception 'Pièces jointes trop volumineuses (3 Mo maximum)'; end if;
  d := p_data - 'id' - 'statut' - 'historique' - 'ref' - 'document';
  if d ? 'paiement' then d := jsonb_set(d, '{paiement,statut}', case when coalesce((d->>'montant')::numeric, 0) > 0 then '"À régler"'::jsonb else '"Gratuit"'::jsonb end); end if;
  if p_col = 'demandes' then ref := 'PG-' || yr || '-' || lpad(nextval('demande_seq')::text, 5, '0'); first := 'Nouvelle';
  elsif p_col = 'signalements' then ref := 'SIG-' || yr || '-' || lpad(nextval('signal_seq')::text, 4, '0'); first := 'Nouveau'; end if;
  if ref is not null then
    d := d || jsonb_build_object('ref', ref, 'statut', first, 'date', now(),
      'historique', jsonb_build_array(jsonb_build_object('date', now(), 'statut', first, 'note', case when p_col = 'demandes' then 'Demande reçue en ligne.' else 'Signalement reçu.' end, 'pub', true)));
  else d := d || jsonb_build_object('date', now(), 'lu', false); end if;
  insert into records(id, col, arr, data) values (substr(p_col,1,1) || replace(gen_random_uuid()::text,'-',''), p_col, greatest(0, least(4, coalesce(p_arr,0))), d);
  return ref;
end $$;

-- Suivi : numéro de dossier + 6 derniers chiffres du téléphone (protège les documents d'état civil)
drop function if exists public.suivi_dossier(text);
create or replace function public._telkey(t text) returns text language sql immutable as $$ select right(regexp_replace(coalesce(t,''), '\D', '', 'g'), 6) $$;
create or replace function public._pub(r public.records) returns jsonb language sql stable as $$
  select jsonb_build_object('ref', r.data->>'ref', 'typeId', r.data->>'type', 'type', r.data->>'typeLabel', 'statut', r.data->>'statut', 'date', r.data->>'date', 'arr', r.arr,
    'prenom', r.data->>'prenom', 'nom', r.data->>'nom', 'quartier', r.data->>'quartier', 'montant', coalesce((r.data->>'montant')::numeric, 0),
    'paiement', r.data->'paiement', 'document', r.data->'document',
    'historique', coalesce((select jsonb_agg(h) from jsonb_array_elements(r.data->'historique') h where (h->>'pub')::boolean), '[]'::jsonb))
$$;
create or replace function public.suivi_dossier(p_ref text, p_tel text) returns jsonb
language sql stable security definer set search_path = public as $$
  select _pub(r) from records r where col in ('demandes','signalements') and data->>'ref' = upper(trim(p_ref))
    and length(_telkey(p_tel)) = 6 and _telkey(data->>'tel') = _telkey(p_tel) limit 1
$$;

-- Paiement en ligne. DÉMONSTRATION : confirmé depuis le navigateur.
-- EN PRODUCTION : n'appeler cette fonction que depuis le webhook signé du prestataire de paiement
-- (Airtel Money, agrégateur type E-Billing, banque), jamais directement depuis le site.
create or replace function public.pay_public(p_ref text, p_tel text, p_mode text) returns jsonb
language plpgsql security definer set search_path = public as $$
declare r records; q text := 'Q-' || to_char(now(), 'YY') || '-' || lpad((floor(random() * 1e6))::text, 6, '0'); m numeric;
begin
  if p_mode not in ('Airtel Money','Carte bancaire') then raise exception 'Moyen de paiement non autorisé'; end if;
  select * into r from records where col = 'demandes' and data->>'ref' = upper(trim(p_ref)) and length(_telkey(p_tel)) = 6 and _telkey(data->>'tel') = _telkey(p_tel) for update;
  if r.id is null then raise exception 'Dossier introuvable'; end if;
  if r.data->'paiement'->>'statut' = 'Payé' then return _pub(r); end if;
  m := coalesce((r.data->>'montant')::numeric, 0);
  if m <= 0 then raise exception 'Démarche gratuite'; end if;
  update records set data = jsonb_set(jsonb_set(data, '{paiement}', jsonb_build_object('choix','en ligne','statut','Payé','mode',p_mode,'date',now(),'quittance',q,
      'transaction', case when p_mode = 'Airtel Money' then 'AM' else 'CB' end || floor(random()*1e9)::text)),
    '{historique}', coalesce(data->'historique','[]'::jsonb) || jsonb_build_array(jsonb_build_object('date', now(), 'statut', data->>'statut', 'note', 'Paiement reçu (' || p_mode || ') : ' || m || ' FCFA.', 'pub', true)))
    where id = r.id returning * into r;
  insert into records(id, col, arr, data) values ('r' || replace(gen_random_uuid()::text,'-',''), 'recettes', r.arr, jsonb_build_object('quittance', q,
    'nature', case r.data->>'type' when 'permis' then 'Permis de construire' when 'domaine' then 'Occupation du domaine public' when 'place' then 'Droits de place (marchés)' else 'Frais d''actes d''état civil' end,
    'montant', m, 'payeur', (r.data->>'prenom') || ' ' || (r.data->>'nom'), 'mode', p_mode, 'agent', 'Paiement en ligne', 'date', now()));
  return _pub(r);
end $$;

create or replace function public.mark_downloaded(p_ref text, p_tel text) returns void
language sql security definer set search_path = public as $$
  update records set data = jsonb_set(jsonb_set(data, '{statut}', '"Remise"'), '{historique}', coalesce(data->'historique','[]'::jsonb)
    || jsonb_build_array(jsonb_build_object('date', now(), 'statut', 'Remise', 'note', 'Document téléchargé en ligne par le demandeur.', 'pub', true)))
  where col = 'demandes' and data->>'ref' = upper(trim(p_ref)) and length(_telkey(p_tel)) = 6 and _telkey(data->>'tel') = _telkey(p_tel) and data->>'statut' = 'Prête'
$$;

create or replace function public.public_publications() returns setof public.records
language sql stable security definer set search_path = public as $$
  select * from records where col = 'publications' and (data->>'publie')::boolean order by created_at desc limit 50
$$;

grant execute on function public.submit_public(text,int,jsonb), public.suivi_dossier(text,text), public.pay_public(text,text,text), public.mark_downloaded(text,text), public.public_publications() to anon, authenticated;

-- ---------------------------------------------------------------------
-- 4. Comptes agents
-- ---------------------------------------------------------------------
create or replace function public._create_user(p_login text, p_password text, p_role text, p_arr int, p_prenom text, p_nom text, p_titre text default null) returns uuid
language plpgsql security definer set search_path = public, extensions as $$
declare uid uuid := gen_random_uuid(); em text := lower(trim(p_login)) || '@mairie-pog.local';
begin
  if length(coalesce(p_password,'')) < 6 then raise exception 'Le mot de passe doit contenir au moins 6 caractères'; end if;
  if exists(select 1 from profiles where lower(login) = lower(trim(p_login))) then raise exception 'Cet identifiant existe déjà'; end if;
  insert into auth.users (instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
    raw_app_meta_data, raw_user_meta_data, created_at, updated_at, confirmation_token, email_change, email_change_token_new, recovery_token)
  values ('00000000-0000-0000-0000-000000000000', uid, 'authenticated', 'authenticated', em, crypt(p_password, gen_salt('bf')), now(),
    '{"provider":"email","providers":["email"]}', '{}', now(), now(), '', '', '', '');
  insert into auth.identities (id, user_id, provider_id, identity_data, provider, last_sign_in_at, created_at, updated_at)
  values (gen_random_uuid(), uid, uid::text, jsonb_build_object('sub', uid::text, 'email', em, 'email_verified', true), 'email', now(), now(), now());
  insert into profiles(id, role, arr, login, prenom, nom, titre) values (uid, p_role, coalesce(p_arr,0), trim(p_login), trim(p_prenom), trim(p_nom), nullif(p_titre,''));
  return uid;
end $$;
revoke all on function public._create_user(text,text,text,int,text,text,text) from public, anon, authenticated;

create or replace function public.admin_create_user(p_login text, p_password text, p_role text, p_arr int, p_prenom text, p_nom text, p_titre text default null) returns uuid
language plpgsql security definer set search_path = public as $$
begin
  if (select role from profiles where id = auth.uid()) is distinct from 'sg' then raise exception 'Accès réservé au secrétariat général'; end if;
  return _create_user(p_login, p_password, p_role, p_arr, p_prenom, p_nom, p_titre);
end $$;
create or replace function public.admin_set_password(p_user uuid, p_password text) returns void
language plpgsql security definer set search_path = public, extensions as $$
begin
  if (select role from profiles where id = auth.uid()) is distinct from 'sg' then raise exception 'Accès réservé au secrétariat général'; end if;
  if length(coalesce(p_password,'')) < 6 then raise exception 'Le mot de passe doit contenir au moins 6 caractères'; end if;
  update auth.users set encrypted_password = crypt(p_password, gen_salt('bf')), updated_at = now() where id = p_user;
end $$;
create or replace function public.admin_delete_user(p_user uuid) returns void
language plpgsql security definer set search_path = public as $$
begin
  if (select role from profiles where id = auth.uid()) is distinct from 'sg' then raise exception 'Accès réservé au secrétariat général'; end if;
  if p_user = auth.uid() then raise exception 'Vous ne pouvez pas supprimer votre propre compte'; end if;
  delete from auth.users where id = p_user;
end $$;
revoke all on function public.admin_create_user(text,text,text,int,text,text,text), public.admin_set_password(uuid,text), public.admin_delete_user(uuid) from public, anon;
grant execute on function public.admin_create_user(text,text,text,int,text,text,text), public.admin_set_password(uuid,text), public.admin_delete_user(uuid) to authenticated;

-- ---------------------------------------------------------------------
-- 5. Temps réel
-- ---------------------------------------------------------------------
do $$ begin alter publication supabase_realtime add table public.records; exception when duplicate_object then null; end $$;

-- ---------------------------------------------------------------------
-- 6. Comptes de démonstration (à changer avant la mise en service)
-- ---------------------------------------------------------------------
do $$ begin
  if not exists (select 1 from profiles) then
    perform _create_user('maire','pog2026','maire',0,'Cabinet','du Maire','Cabinet du maire');
    perform _create_user('secretariat','admin2026','sg',0,'Secrétariat','Général','Administrateur');
    perform _create_user('etat.civil','agent2026','etatcivil',0,'Service','État civil','Service central de l''état civil');
    perform _create_user('services.techniques','agent2026','technique',0,'Services','techniques','Direction des services techniques');
    perform _create_user('recettes','agent2026','finances',0,'Recette','municipale','Finances & recettes');
    perform _create_user('rh','agent2026','rh',0,'Ressources','humaines','Ressources humaines');
    perform _create_user('arr1','arr2026','arrondissement',1,'Mairie','du 1er arrondissement','Mairie du 1er arrondissement');
    perform _create_user('arr2','arr2026','arrondissement',2,'Mairie','du 2e arrondissement','Mairie du 2e arrondissement');
    perform _create_user('arr3','arr2026','arrondissement',3,'Mairie','du 3e arrondissement','Mairie du 3e arrondissement');
    perform _create_user('arr4','arr2026','arrondissement',4,'Mairie','du 4e arrondissement','Mairie du 4e arrondissement');
  end if;
end $$;
