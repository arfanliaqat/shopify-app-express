select
       to_char(po.created_date, 'FMMonth YYYY'),
       sh.public_domain,
       count(distinct order_id) as orders,
       sh.uninstalled::date as uninstalled
from product_orders po
join shop_resources sr on sr.id = po.shop_resource_id
join shops sh on sh.id = sr.shop_id
and sh.created_date > '2021-06-17'
group by 1, 2, 4
order by 1 desc, 3 desc;
