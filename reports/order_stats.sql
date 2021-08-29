select
       to_char(po.created_date, 'FMMonth YYYY'),
       sh.public_domain,
       coalesce(sp.order_limit, 15) as plan_limit,
       count(distinct order_id) as orders,
       sh.uninstalled::date as uninstalled
from product_orders po
join shop_resources sr on sr.id = po.shop_resource_id
join shops sh on sh.id = sr.shop_id
left join shop_plans sp on sp.shop_id = sh.id
and sh.created_date > '2021-06-17'
group by 1, 2, 3, 5
order by 1 desc, 4 desc;
