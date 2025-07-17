from django.test import TestCase
from django.contrib.auth import get_user_model

from rest_framework.test import APIClient

from .models import Stock

User = get_user_model()

class StockTestCase(TestCase):
    def setUp(self):
        self.user_a = User.objects.create_user(username='userA', password='password')
        self.user_b = User.objects.create_user(username='userB', password='password')
        Stock.objects.create(ticker='ABC')
        Stock.objects.create(ticker='XYZ')
        self.stock_count = Stock.objects.all().count()
    
    def get_client(self):
        client = APIClient()
        client.login(username=self.user_a.username, password='password')
        return client

    def test_user_add_stock(self):
        client = self.get_client()
        response = client.post('/api/stocks/ABC/action/')
        print('DEBUG: status_code:', response.status_code)
        print('DEBUG: content:', response.content)
        print('DEBUG: Location:', response.get('Location', None))
        self.assertEqual(response.status_code, 200)
        ticker = response.json().get('ticker')
        self.assertEqual(ticker, 'ABC')
        user = self.user_a
        user_tracking = user.tracking.all().first()
        self.assertEqual(user_tracking.ticker, ticker)
        self.assertEqual(response.json().get('is_tracking'), True)

    def test_stock_detail_api(self):
        client = self.get_client()
        # Add stock to user's tracking so it exists
        client.post('/api/stocks/ABC/action/', follow=True)
        # Test valid ticker
        response = client.get('/api/stocks/ABC/', follow=True)
        self.assertEqual(response.status_code, 200)
        self.assertIn('ticker', response.json())
        self.assertEqual(response.json().get('ticker'), 'ABC')
        # Test invalid ticker
        response = client.get('/api/stocks/NOTREAL/', follow=True)
        self.assertEqual(response.status_code, 404)

    def test_yfinance_fetch(self):
        import yfinance as yf
        data = yf.Ticker("MSFT").history(period="1d")
        print('DEBUG: yfinance MSFT data:', data)
        self.assertFalse(data.empty, "yfinance did not return data for MSFT")

    def test_prediction_api(self):
        client = self.get_client()
        # Ensure the stock exists and is tracked by the user
        client.post('/api/stocks/MSFT/action/')
        response = client.post('/api/prediction/create', {'ticker': 'MSFT'}, content_type='application/json')
        print('DEBUG: prediction API status:', response.status_code)
        print('DEBUG: prediction API content:', response.content)
        self.assertEqual(response.status_code, 201)
        self.assertIn('future_value', response.json()['prediction'])