create table shops (
	id uuid default uuid_generate_v4(),
	domain text not null,
	email text not null,
	raw_data jsonb not null,
	created_date timestamp with time zone default now(),
	primary key (id)
);

create unique index ind_shops_domain on shops (domain);
