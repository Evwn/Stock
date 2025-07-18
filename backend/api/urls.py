from django.urls import path
from .views import RegisterView, TickerListView, PredictionView, YahooChartProxy
from rest_framework.authtoken.views import obtain_auth_token

urlpatterns = [
    path('auth/register/', RegisterView.as_view(), name='register'),
    path('auth/login/', obtain_auth_token, name='login'),
    path('prediction/tickers/', TickerListView.as_view(), name='ticker-list'),
    path('prediction/create/', PredictionView.as_view(), name='prediction-create'),
    path('yahoo/chart/<str:ticker>/', YahooChartProxy.as_view(), name='yahoo-chart'),
] 