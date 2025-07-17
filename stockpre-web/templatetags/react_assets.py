import os
import json
from django import template
from django.conf import settings
from django.utils.safestring import mark_safe

register = template.Library()

def get_manifest():
    manifest_path = os.path.join(
        settings.BASE_DIR, "stockpre-web", "build", "asset-manifest.json"
    )
    try:
        with open(manifest_path, "r") as f:
            return json.load(f)
    except Exception:
        return {}

@register.simple_tag
def react_css():
    manifest = get_manifest()
    css_tags = []
    for file, path in manifest.get("files", {}).items():
        if file.endswith(".css"):
            css_tags.append(f'<link rel="stylesheet" href="{settings.STATIC_URL}{path.lstrip("/")}" />')
    return mark_safe("\n".join(css_tags))

@register.simple_tag
def react_js():
    manifest = get_manifest()
    js_tags = []
    for file, path in manifest.get("files", {}).items():
        if file.endswith(".js"):
            js_tags.append(f'<script src="{settings.STATIC_URL}{path.lstrip("/")}" defer></script>')
    return mark_safe("\n".join(js_tags)) 