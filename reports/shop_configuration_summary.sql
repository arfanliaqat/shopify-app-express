select sh.created_date::date,
       sh.domain,
       sh.raw_data->'country' as country,
       sp.plan,
       ws.settings->'showOnPage' as show_on_page,
       ws.settings->'pickerType' as picker_type,
       ws.settings->'filterType' as filter_type,
       ws.settings->'locale' as locale
from shops sh
join widget_settings ws on ws.shop_id = sh.id
join shop_plans sp on sp.shop_id = sh.id
where sh.created_date > '2021-06-17'
and sh.uninstalled is null
order by sh.created_date desc;
