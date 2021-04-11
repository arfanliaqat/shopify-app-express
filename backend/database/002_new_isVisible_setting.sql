update widget_settings set settings = jsonb_set(settings, '{isVisible}', 'true');
