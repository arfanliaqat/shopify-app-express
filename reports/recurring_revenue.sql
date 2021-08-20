with mrr as (
    select sum(sp.price) as value
    from shops sh join shop_plans sp on sh.id = sp.shop_id
    where uninstalled is null
      and sp.plan <> 'BASIC'
      and sh.created_date > '2021-06-17'
)
select (select value from mrr) as monthly_recurring_revenue, (select value from mrr) * 12 as annual_recurring_revenue;
