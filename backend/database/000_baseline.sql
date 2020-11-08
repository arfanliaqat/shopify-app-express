create table shops(
	id uuid default uuid_generate_v4(),
	domain text not null,
	email text not null,
	raw_data jsonb not null,
	created_date not null timestamp with time zone default now(),
	primary key (id)
);

create unique index ind_shops_domain on shops(domain);

create table access_tokens(
	token text not null,
	shop_id uuid not null references shops(id),
	scopes text not null,
	created_date timestamp with time zone not null default now(),
	primary key (token)
);

create unique index ind_access_token_shop_id on access_tokens(shop_id);

create table shop_resources(
	id uuid default uuid_generate_v4(),
	shop_id uuid not null references shops(id),
	resource_type text not null,
	resource_id text not null,
	title text not null,
	created_date timestamp with time zone not null default now(),
	primary key (id)
);

create unique index ind_unique_shop_resource_gid on shop_resources (resource_type, resource_id);
create index ind_shop_resource_shop_id on shop_resources (shop_id);

create table product_capacities(
	id uuid default uuid_generate_v4(),
	shop_resource_id uuid not null references shop_resources(id),
	capacity integer,
	start_date timestamp with time zone not null,
	end_date timestamp with time zone not null,
	dates jsonb, -- to be refactored into a separate table
	created_date timestamp with time zone not null default now(),
	primary key (id)
);

create index ind_product_capacities_shop_resource_id on product_capacities (shop_resource_id);
create index ind_product_capacities_start_date on product_capacities (start_date);
create index ind_product_capacities_end_date on product_capacities (end_date);
