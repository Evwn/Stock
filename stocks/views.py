import os
from django.shortcuts import render, redirect
from django.http import HttpResponse, HttpResponseNotFound
from django.conf import settings


def stock_home_view(request, *args, **kwargs):
    if request.user.is_authenticated:
        return render(request, 'pages/home.html')
    else:
        return redirect('/login')


def stock_detail_view(request, ticker, *args, **kwargs):
    return render(request, 'stocks/ticker.html', context={"ticker": ticker})


def serve_react(request):
    """
    Dynamically serve the React build's index.html for the SPA.
    """
    build_dir = os.path.join(settings.BASE_DIR, 'stockpre-web', 'build')
    index_path = os.path.join(build_dir, 'index.html')
    try:
        with open(index_path, encoding='utf-8') as f:
            return HttpResponse(f.read())
    except FileNotFoundError:
        return HttpResponseNotFound(
            "<h1>React build not found. Please run npm run build in the frontend.</h1>"
        )
