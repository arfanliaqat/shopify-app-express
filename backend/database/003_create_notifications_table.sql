create table notifications(
    id uuid default uuid_generate_v4(),
    shop_id uuid not null references shops(id),
    type text not null,
    created_date timestamp with time zone not null default now(),
    primary key (id)
);

create index ind_notifications_shop_id on notifications(shop_id);
create index ind_notifications_type on notifications(type);
create index ind_notifications_created_date on notifications(created_date);
