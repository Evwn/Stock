from django.contrib.auth.models import User
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.authtoken.models import Token
from rest_framework.permissions import IsAuthenticated
from rest_framework.decorators import api_view, permission_classes
import yfinance as yf
import numpy as np
import datetime
import sys
sys.path.append('../../prediction')
from prediction.analysis import get_prediction


TICKERS = [
    "AAPL", "MSFT", "GOOGL", "AMZN", "TSLA", "META", "NVDA",
  'A', 'AAL', 'AAP','ABBV', 'ABNB', 'ABT', 'ACGL', 'ACN', 'ADBE', 'ADI', 'ADM', 'ADP', 'AEE', 'AEP', 'AES', 'AFL', 'AIG', 'AIZ', 'AJG', 'AKAM', 'ALB', 'ALGN', 'ALLE', 'ALL', 'AMAT', 'AMCR', 'AMD', 'AME', 'AMGN', 'AMP', 'AMT', 'ANET', 'ANSS', 'AON', 'AOS', 'APA', 'APD', 'APH', 'APO', 'APP', 'APTV', 'ARE', 'ATO', 'AVB', 'AVGO', 'AVY', 'AWK', 'AXON', 'AZN', 'AZO', 'BALL', 'BAC', 'BA', 'BBY', 'BDX', 'BEN', 'BF.B', 'BIIB', 'BK', 'BKNG', 'BLDR', 'BLK', 'BMY', 'BR', 'BRK-B', 'BRO', 'BSX', 'BXP', 'C', 'CAG', 'CAH', 'CARR', 'CAT', 'CB', 'CBOE', 'CBRE', 'CCI', 'CCL', 'CDNS', 'CDW', 'CEG', 'CF', 'CFG', 'CHD', 'CHRW', 'CHTR', 'CI', 'CINF', 'CL', 'CLX', 'CMA', 'CMCSA', 'CME', 'CMG', 'CMI', 'CNP', 'COF', 'COIN', 'COO', 'COP', 'COR', 'COST', 'CPB', 'CPAY', 'CPRT', 'CPT', 'CRL', 'CRM', 'CRWD', 'CSCO', 'CSGP', 'CSX', 'CTAS', 'CTVA', 'CTRA', 'CTS', 'CTSH', 'CVS', 'CVX', 'CZ', 'CZR', 'D', 'DAL', 'DAY', 'DE', 'DECK', 'DHI', 'DHR', 'DIS', 'DLTR', 'DOV', 'DPZ', 'DRE', 'DRI', 'DTE', 'DUK', 'DVA', 'DVN', 'DXCM', 'ECL', 'ED', 'EFX', 'EG', 'EIX', 'EL', 'ELV', 'EMN', 'EMR', 'ENPH', 'EOG', 'EQIX', 'EQR', 'EQT', 'ES', 'ESS', 'ETN', 'ETR', 'EVRG', 'EW', 'EXC', 'EXE', 'EXPE', 'EXR', 'F', 'FAST', 'FCX', 'FDS', 'FE', 'FFIV', 'FI', 'FICO', 'FIS', 'FITB', 'FLT', 'FMC', 'FOX', 'FOXA', 'FRT', 'FSLR', 'FTNT', 'FTV', 'GD', 'GE', 'GEHC', 'GEN', 'GEO', 'GEV', 'GFS', 'GILD', 'GIS', 'GL', 'GLW', 'GM', 'GNRC', 'GOOG', 'GPC', 'GPN', 'GRMN', 'GWW', 'HAS', 'HBAN', 'HCA', 'HD', 'HES', 'HIG', 'HLT', 'HOLX', 'HON', 'HPE', 'HPQ', 'HRL', 'HSIC', 'HSY', 'HST', 'HUBB', 'HUM', 'HWM', 'IBM', 'ICE', 'IDXX', 'IFF', 'ILMN', 'INCY', 'INTC', 'INTU', 'INVH', 'IP', 'IPG', 'IQV', 'IR', 'IRM', 'ISRG', 'IT', 'ITW', 'IVZ', 'J', 'JBHT', 'JKHY', 'JNJ', 'JNPR', 'JPM', 'JCI', 'K', 'KEY', 'KEYS', 'KHC', 'KIM', 'KLAC', 'KMB', 'KMI', 'KMX', 'KO', 'KR', 'KVUE', 'L', 'LDOS', 'LEN', 'LH', 'LIN', 'LKQ', 'LLY', 'LMT', 'LNT', 'LOW', 'LRCX', 'LULU', 'LUV', 'LW', 'LYB', 'LYV', 'MA', 'MAA', 'MAR', 'MAS', 'MCD', 'MCK', 'MCO', 'MDLZ', 'MDT', 'MET', 'MKC', 'MKTX', 'MLM', 'MMC', 'MMM', 'MNST', 'MO', 'MOH', 'MOS', 'MPC', 'MPWR', 'MRK', 'MRNA', 'MRVL', 'MS', 'MSCI', 'MSI', 'MTB', 'MTCH', 'MTD', 'MU', 'NCLH', 'NDAQ', 'NEE', 'NEM', 'NI', 'NKE', 'NOC', 'NOW', 'NRG', 'NSC', 'NTAP', 'NTRS', 'NUE', 'NVR', 'NWS', 'NWSA', 'NXPI', 'O', 'ODFL', 'OKE', 'OMC', 'ON', 'ORCL', 'ORLY', 'OTIS', 'OXY', 'PARA', 'PAYC', 'PAYX', 'PCAR', 'PCG', 'PDD', 'PEP', 'PFE', 'PFG', 'PG', 'PGR', 'PH', 'PHM', 'PKG', 'PLD', 'PLTR', 'PM', 'PNC', 'PNR', 'PNW', 'POOL', 'PPG', 'PPL', 'PRU', 'PSA', 'PSX', 'PTC', 'PWR', 'PXD', 'PYPL', 'QCOM', 'QRVO', 'RCL', 'REG', 'REGN', 'RF', 'RHI', 'RMD', 'ROK', 'ROL', 'ROP', 'ROST', 'RSG', 'RTX', 'RVTY', 'SBAC', 'SBUX', 'SCHW', 'SEDG', 'SEE', 'SHW', 'SJM', 'SLB', 'SMCI', 'SNA', 'SNPS', 'SO', 'SOLV', 'SPG', 'SPGI', 'SRE', 'STE', 'STLD', 'STT', 'STX', 'STZ', 'SW', 'SWK', 'SWKS', 'SYF', 'SYK', 'SYY', 'T', 'TAP', 'TDG', 'TDY', 'TEAM', 'TECH', 'TEL', 'TER', 'TFC', 'TFX', 'TGT', 'TJX', 'TMO', 'TMUS', 'TPR', 'TRGP', 'TRMB', 'TROW', 'TRV', 'TSCO', 'TSN', 'TT', 'TTWO', 'TTC', 'TTD', 'TYL', 'UAL', 'UDR', 'UHS', 'ULTA', 'UNH', 'UNP', 'UPS', 'URI', 'USB', 'V', 'VICI', 'VLO', 'VLTO', 'VMC', 'VRSK', 'VRSN', 'VRT', 'VTR', 'VTRS', 'VZ', 'WAB', 'WAT', 'WBA', 'WBD', 'WDC', 'WEC', 'WELL', 'WFC', 'WHR', 'WM', 'WMB', 'WMT', 'WRB', 'WRK', 'WSM', 'WST', 'WTW', 'WY', 'WYNN', 'XEL', 'XOM', 'XYL', 'YUM', 'ZBH', 'ZBRA', 'ZION', 'ZTS'
]

class RegisterView(APIView):
    def post(self, request):
        username = request.data.get('username')
        password = request.data.get('password')
        email = request.data.get('email', '')
        if not username or not password:
            return Response({'detail': 'Username and password required.'}, status=status.HTTP_400_BAD_REQUEST)
        if User.objects.filter(username=username).exists():
            return Response({'detail': 'Username already exists.'}, status=status.HTTP_400_BAD_REQUEST)
        user = User.objects.create_user(username=username, password=password, email=email)
        token, created = Token.objects.get_or_create(user=user)
        return Response({'token': token.key, 'user': {'username': user.username, 'email': user.email}}, status=status.HTTP_201_CREATED)

class TickerListView(APIView):
    def get(self, request):
        return Response(TICKERS)

class PredictionView(APIView):
    def post(self, request):
        ticker = request.data.get('ticker')
        try:
            # Use real model prediction
            base_pred, _, _ = get_prediction(ticker)
            #print("Model prediction for {}: {}".format(ticker, base_pred))
        except Exception as e:
            return Response({'detail': str(e)}, status=status.HTTP_400_BAD_REQUEST)
        # Fetch historical data for RSI/MACD
        data = yf.Ticker(ticker).history(period="6mo", interval="1d")
        if data.empty or len(data) < 30:
            return Response({'detail': 'Not enough data for indicators.'}, status=status.HTTP_400_BAD_REQUEST)
        close = data['Close']
        # Calculate RSI
        delta = close.diff()
        up = delta.clip(lower=0)
        down = -1 * delta.clip(upper=0)
        roll_up = up.rolling(14).mean()
        roll_down = down.rolling(14).mean()
        rs = roll_up / roll_down
        rsi = 100.0 - (100.0 / (1.0 + rs))
        latest_rsi = rsi.iloc[-1] if not rsi.isna().all() else 50
        # Calculate MACD
        exp1 = close.ewm(span=12, adjust=False).mean()
        exp2 = close.ewm(span=26, adjust=False).mean()
        macd = exp1 - exp2
        signal = macd.ewm(span=9, adjust=False).mean()
        latest_macd = macd.iloc[-1] if not macd.isna().all() else 0
        latest_signal = signal.iloc[-1] if not signal.isna().all() else 0
        # Adjust prediction based on RSI/MACD
        adjustment = 0
        if latest_rsi > 70:
            adjustment -= abs(base_pred) * 0.03  # Overbought, lower prediction
        elif latest_rsi < 30:
            adjustment += abs(base_pred) * 0.03  # Oversold, raise prediction
        if latest_macd > latest_signal:
            adjustment += abs(base_pred) * 0.02  # Bullish MACD
        elif latest_macd < latest_signal:
            adjustment -= abs(base_pred) * 0.02  # Bearish MACD
        adj_pred = base_pred + adjustment
        # Get current price
        current_price = float(close.iloc[-1])
        # If predicted value is within ±10 units of current price, use as-is
        if abs(adj_pred - current_price) <= 10:
            final_pred = adj_pred
        else:
            # If the model's prediction is far, use a weighted average to bring it closer to current price
            final_pred = 0.7 * current_price + 0.3 * adj_pred
            # Clamp to ±10 units
            if final_pred > current_price + 10:
                final_pred = current_price + 10
            elif final_pred < current_price - 10:
                final_pred = current_price - 10
        final_pred = round(final_pred, 2)
        # Set prediction date to next trading day (skip weekends)
        today = datetime.date.today()
        next_day = today + datetime.timedelta(days=1)
        while next_day.weekday() >= 5:  # 5 = Saturday, 6 = Sunday
            next_day += datetime.timedelta(days=1)
        pred_date = next_day.strftime('%Y-%m-%d')
        # Set range to ±2 of the prediction
        lower_val = round(final_pred - 2.0, 2)
        upper_val = round(final_pred + 2.0, 2)
        # Return adjusted prediction
        return Response({
            'prediction': {
                'future_value': final_pred,
                'lower_value': lower_val,
                'upper_value': upper_val,
            },
            'stock': {
                'ticker': ticker,
                'company_name': '',
                'is_tracking': False
            },
            'prediction_date': pred_date
        })

class YahooChartProxy(APIView):
    def get(self, request, ticker):
        try:
            data = yf.Ticker(ticker).history(period="1y", interval="1d")
            if data.empty:
                return Response({'detail': 'No data found for ticker.'}, status=status.HTTP_404_NOT_FOUND)
            # Format data for frontend chart
            chart = [
                {
                    'date': str(idx.date()),
                    'close': float(row['Close']) if not (row['Close'] is None or row['Close'] != row['Close']) else None
                }
                for idx, row in data.iterrows()
            ]
            chart = [d for d in chart if d['close'] is not None]
            return Response({'chart': chart})
        except Exception as e:
            return Response({'detail': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR) 