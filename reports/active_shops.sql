select
    sh.created_date::date,
    sh.public_domain,
    sh.domain,
    (select count(*) from product_orders po join shop_resources sr on po.shop_resource_id = sr.id where sr.shop_id = sh.id) as total_orders,
    sp.plan,
    sp.price,
    sp.order_limit
from shops sh
left join shop_plans sp on sp.shop_id = sh.id
where sh.created_date > '2021-06-17'
and sh.uninstalled is null
order by 1 desc;
