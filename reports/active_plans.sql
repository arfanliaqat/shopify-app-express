select sh.public_domain, sp.plan, sp.price, order_limit
from shops sh
join shop_plans sp on sh.id = sp.shop_id
where uninstalled is null
and sp.plan <> 'BASIC'
and sh.created_date > '2021-06-17';
