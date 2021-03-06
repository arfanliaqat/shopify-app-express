select
    to_char(po.created_date, 'FMMonth YYYY'),
    count(distinct order_id) as orders
from product_orders po
         join shop_resources sr on sr.id = po.shop_resource_id
         join shops sh on sh.id = sr.shop_id
    and sh.created_date > '2021-06-17'
group by 1
order by 1 desc;
