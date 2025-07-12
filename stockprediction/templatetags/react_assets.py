import json
import os
from django import template
from django.conf import settings
from django.templatetags.static import static

register = template.Library()

@register.simple_tag
def react_assets():
    """
    Dynamically loads React assets from asset-manifest.json
    Returns HTML script and link tags for all entrypoints
    """
    manifest_path = os.path.join(settings.STATIC_ROOT, 'asset-manifest.json')
    
    if not os.path.exists(manifest_path):
        # Fallback to build directory if not collected yet
        build_path = os.path.join(settings.BASE_DIR, 'stockpre-web', 'build', 'asset-manifest.json')
        if os.path.exists(build_path):
            manifest_path = build_path
        else:
            return "<!-- React assets not found -->"
    
    try:
        with open(manifest_path, 'r') as f:
            manifest = json.load(f)
        
        html = []
        
        # Add CSS files first
        for entrypoint in manifest.get('entrypoints', []):
            if entrypoint.endswith('.css'):
                html.append(f'<link href="{entrypoint}" rel="stylesheet">')
        
        # Add JS files
        for entrypoint in manifest.get('entrypoints', []):
            if entrypoint.endswith('.js'):
                html.append(f'<script src="{entrypoint}"></script>')
        
        return '\n'.join(html)
        
    except Exception as e:
        return f"<!-- Error loading React assets: {e} -->"

@register.simple_tag
def react_css():
    """
    Returns only CSS link tags from React assets
    """
    manifest_path = os.path.join(settings.STATIC_ROOT, 'asset-manifest.json')
    
    if not os.path.exists(manifest_path):
        build_path = os.path.join(settings.BASE_DIR, 'stockpre-web', 'build', 'asset-manifest.json')
        if os.path.exists(build_path):
            manifest_path = build_path
        else:
            return "<!-- React CSS not found -->"
    
    try:
        with open(manifest_path, 'r') as f:
            manifest = json.load(f)
        
        html = []
        for entrypoint in manifest.get('entrypoints', []):
            if entrypoint.endswith('.css'):
                html.append(f'<link href="{entrypoint}" rel="stylesheet">')
        
        return '\n'.join(html)
        
    except Exception as e:
        return f"<!-- Error loading React CSS: {e} -->"

@register.simple_tag
def react_js():
    """
    Returns only JS script tags from React assets
    """
    manifest_path = os.path.join(settings.STATIC_ROOT, 'asset-manifest.json')
    
    if not os.path.exists(manifest_path):
        build_path = os.path.join(settings.BASE_DIR, 'stockpre-web', 'build', 'asset-manifest.json')
        if os.path.exists(build_path):
            manifest_path = build_path
        else:
            return "<!-- React JS not found -->"
    
    try:
        with open(manifest_path, 'r') as f:
            manifest = json.load(f)
        
        html = []
        for entrypoint in manifest.get('entrypoints', []):
            if entrypoint.endswith('.js'):
                html.append(f'<script src="{entrypoint}"></script>')
        
        return '\n'.join(html)
        
    except Exception as e:
        return f"<!-- Error loading React JS: {e} -->" 