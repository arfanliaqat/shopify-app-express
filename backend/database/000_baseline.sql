create table shops(
	id uuid default uuid_generate_v4(),
	domain text not null,
	email text not null,
	raw_data jsonb not null,
	created_date timestamp with time zone default now(),
	primary key (id)
);

create unique index ind_shops_domain on shops(domain);

create table access_tokens(
	token text not null,
	shop_id uuid references shops(id),
	scopes text not null,
	primary key (token)
);

create unique index ind_access_token_shop_id on access_tokens(shop_id)
