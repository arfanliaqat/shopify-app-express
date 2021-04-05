alter table shops add column public_domain text;
create unique index ind_shops_public_domain on shops(public_domain);
update shops set public_domain = domain where 1 = 1;
alter table shops alter column public_domain set not null;

