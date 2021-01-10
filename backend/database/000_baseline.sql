create table shops(
	id uuid default uuid_generate_v4(),
	domain text not null,
	email text not null,
	raw_data jsonb not null,
	created_date timestamp with time zone not null default now(),
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
	resource_id bigint not null,
	title text not null,
	created_date timestamp with time zone not null default now(),
	primary key (id)
);

create unique index ind_unique_shop_resource_gid on shop_resources (resource_type, resource_id);
create index ind_shop_resource_shop_id on shop_resources (shop_id);

create table availability_periods(
	id uuid default uuid_generate_v4(),
	shop_resource_id uuid not null references shop_resources(id),
	quantity integer,
	start_date timestamp with time zone not null,
	end_date timestamp with time zone not null,
	available_dates jsonb not null default '[]'::jsonb,
	paused_dates jsonb not null default '[]'::jsonb,
    availability_periods boolean not null,
	created_date timestamp with time zone not null default now(),
	primary key (id)
);

create index ind_availability_periods_shop_resource_id on availability_periods (shop_resource_id);
create index ind_availability_periods_start_date on availability_periods (start_date);
create index ind_availability_periods_end_date on availability_periods (end_date);

create table product_orders(
	id uuid default uuid_generate_v4(),
	shop_resource_id uuid not null references shop_resources(id),
	order_id bigint not null,
	chosen_date date,
	quantity integer not null,
	created_date timestamp with time zone not null default now(),
	primary key (id)
);

create index ind_product_orders_shop_resource_id on product_orders (shop_resource_id);
create index ind_product_orders_order_id on product_orders (order_id);
create index ind_product_orders_chosen_date on product_orders (chosen_date);
create unique index unique_product_order on product_orders (shop_resource_id, order_id, chosen_date)

create table current_availabilities(
	id uuid not null primary key default uuid_generate_v4(),
	shop_resource_id uuid not null constraint current_availabilities_shop_resources_id_fk references shop_resources,
	next_availability_date date,
	last_availability_date date,
	sold_out_dates integer not null,
	available_dates integer not null,
	updated_date timestamp with time zone default now() not null
);

create unique index current_availabilities_shop_resource_id_index on current_availabilities (shop_resource_id);
