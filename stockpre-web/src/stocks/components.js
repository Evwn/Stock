import React, { useState, useEffect } from "react";
import { apiStockLookup, apiPredictionLookup, apiStockAction } from "./lookup";
import { Stock } from "./detail";
import { StockList } from "./list";
import { ActionButton, AddRemoveButton } from "./buttons";
import { authToken } from "../App.js";
import Swal from 'sweetalert2';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';

import {
  Button,
  Card,
  CardActionArea,
  CardContent,
  CardHeader,
  CardMedia,
  Chip,
  Grid,
  makeStyles,
  Paper,
  Typography,
} from "@material-ui/core";

// Shows single quote and prediction. Routes to detailed view
export function StockLink(props) {
  const {
    stock,
    length,
    didPredictionLookup,
    prediction,
    handleBackendPredictionLookup,
  } = props;
  const [currentPrice, setCurrentPrice] = useState("Loading...");
  const [percentChange, setPercentChange] = useState("Loading...");
  const [currPrediction, setCurrPrediction] = useState(null);
  const [priceHistory, setPriceHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const classes = makeStyles();

  const handleStockLink = (event) => {
    event.preventDefault();
    window.location.href = `/stocks/${stock.ticker.toUpperCase()}`;
  };

  const handleRemove = (event) => {
    event.preventDefault();
    apiStockAction(stock.ticker, false, () => {});
  };

  // Fetch recent price history and current price
  const update = () => {
    setLoading(true);
    fetch(
      `https://query1.finance.yahoo.com/v8/finance/chart/${stock.ticker}?interval=1d&range=1mo`
    ).then((request) => {
      request.json().then((fullfilled_request) => {
        try {
          const result = fullfilled_request.chart.result[0];
          const quote = result.indicators.quote[0];
          const timestamps = result.timestamp;
          const closes = quote.close;
          const opens = quote.open;
          // Build price history for chart
          const history = timestamps.map((t, i) => ({
            date: new Date(t * 1000).toLocaleDateString(),
            close: closes[i],
            open: opens[i],
          }));
          setPriceHistory(history);
          // Set current price and percent change
          const lastIdx = closes.length - 1;
          setCurrentPrice(closes[lastIdx].toFixed(2));
          const percentChange = ((closes[lastIdx] - opens[lastIdx]) / opens[lastIdx]) * 100;
          setPercentChange(
            (percentChange < 0.0 ? "" : "+") + percentChange.toFixed(2) + "%"
          );
        } catch (error) {
          console.error("Error parsing stock data:", error);
          setCurrentPrice("Loading...");
          setPercentChange("Loading...");
          setPriceHistory([]);
        }
        setLoading(false);
      });
    }).catch((error) => {
      console.error("Error fetching stock data:", error);
      setCurrentPrice("Error");
      setPercentChange("Error");
      setPriceHistory([]);
      setLoading(false);
    });
  };

  useEffect(() => {
    if (didPredictionLookup === false && !currPrediction) {
      apiPredictionLookup(stock.ticker, handleBackendPredictionLookup);
    }
    if (prediction && !currPrediction) {
      setCurrPrediction(prediction);
    }
    update();
    const interval = setInterval(() => {
      update();
    }, 30000); // update every 30 seconds
    return () => {
      setCurrPrediction(null);
      clearInterval(interval);
    };
  }, [didPredictionLookup, handleBackendPredictionLookup, prediction]);

  return (
    <Card style={{ margin: '1em', padding: '1em' }}>
      <CardContent>
        <Typography variant="h6" onClick={handleStockLink} style={{ cursor: 'pointer' }}>
          {stock.ticker} - {stock.company_name}
        </Typography>
        <Typography variant="body1">
          Price: <b>{currentPrice}</b> <span style={{ color: percentChange.startsWith('-') ? 'red' : 'green' }}>{percentChange}</span>
        </Typography>
        {currPrediction && (
          <>
            <Typography variant="body2" color="primary">
              Predicted: <b>${currPrediction.future_value.toFixed(2)}</b> (Range: ${currPrediction.lower_value.toFixed(2)} - ${currPrediction.upper_value.toFixed(2)})
            </Typography>
            <Typography variant="caption" color="textSecondary">
              For: {currPrediction.prediction_date}
            </Typography>
          </>
        )}
        <div style={{ width: '100%', height: 150, marginTop: 10 }}>
          <ResponsiveContainer>
            <LineChart data={priceHistory} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
              <XAxis dataKey="date" hide={true} />
              <YAxis domain={['auto', 'auto']} hide={false} width={40} />
              <Tooltip />
              <Line type="monotone" dataKey="close" stroke="#8884d8" dot={false} />
              {currPrediction && (
                <ReferenceLine y={currPrediction.future_value} label="Pred" stroke="red" strokeDasharray="3 3" />
              )}
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}

export function StockListComponent(props) {
  const [newStocks, setNewStocks] = useState([]);
  const handleNewStock = (newStock) => {
    let tempNewStocks = [...newStocks];
    tempNewStocks.unshift(newStock);
    setNewStocks(tempNewStocks);
  };
  return (
    <div className={props.className}>
      <StockList newStocks={newStocks} {...props} />
      <br />
    </div>
  );
}

export function StockDetailComponent(props) {
  const { tickerinit } = props;
  const [didStockLookup, setDidStockLookup] = useState(false);
  const [ticker, setTicker] = useState(null);
  const [isTracking, setIsTracking] = useState(false);
  const [hasPrediction, setHasPrediction] = useState(false);
  const [prediction, setPrediction] = useState(null);
  const [didPredictionLookup, setDidPredictionLookup] = useState(false);

  const handleBackendStockLookup = (response, status) => {
    if (status === 200) {
      setTicker(response.ticker);
      setIsTracking(response.is_tracking);
    } else {
      Swal.fire({icon: 'error', title: 'Stock Error', text: 'Error finding stock'});
    }
  };

  const handleBackendPredictionLookup = (response, status) => {
    if (status === 200) {
      const responsePrediction = response.prediction;
      const newPrediction =
        responsePrediction !== null
          ? {
              future_value: responsePrediction.future_value,
              upper_value: responsePrediction.upper_value,
              lower_value: responsePrediction.lower_value,
              prediction_date: response.prediction_date,
            }
          : null;
      setPrediction(newPrediction);
      setHasPrediction(true);
      setDidPredictionLookup(true);
    } else {
      Swal.fire({icon: 'error', title: 'Prediction Error', text: 'Unable to find prediction'});
    }
  };

  const handleActionBackend = (response, status) => {
    if (status === 200 && isTracking) {
      setIsTracking(false);
      setHasPrediction(false);
      setPrediction(null);
      setTicker(response.ticker);
    } else if (status === 200 && !isTracking) {
      setIsTracking(true);
    } else if (status === 201 && isTracking) {
      //console.log("New pred", response);
      const prediction = response.prediction;
      const newPrediction = {
        future_value: prediction.future_value,
        upper_value: prediction.upper_value,
        lower_value: prediction.lower_value,
        prediction_date: response.prediction_date,
      };
      setPrediction(newPrediction);
      setHasPrediction(true);
    } else {
      Swal.fire({icon: 'error', title: 'Action Error', text: `Can't add/remove, status: ${status}`});
    }
  };

  useEffect(() => {
    if (didStockLookup === false) {
      apiStockLookup(tickerinit, handleBackendStockLookup);
      setDidStockLookup(true);
    }
  }, [tickerinit, didStockLookup, setDidStockLookup]);
  return ticker === null ? null : (
    <div>
      <Grid container direction="column" justify="center" alignItems="center">
        <Stock
          symbol={ticker}
          didPredictionLookup={didPredictionLookup}
          prediction={prediction}
          handleBackendPredictionLookup={handleBackendPredictionLookup}
          className={props.className}
        />
        <PredictionComponent
          ticker={ticker}
          didPredictionLookup={didPredictionLookup}
          prediction={prediction}
          handleBackendPredictionLookup={handleBackendPredictionLookup}
        />
        <Grid container direction="row" alignItems="center" justify="center">
          <AddRemoveButton
            ticker={ticker}
            predict={false}
            isTracking={isTracking}
            handleActionBackend={handleActionBackend}
          />
          {isTracking && (
            <ActionButton
              ticker={ticker}
              predict={true}
              isTracking={isTracking}
              handleActionBackend={handleActionBackend}
            />
          )}
        </Grid>
      </Grid>
    </div>
  );
}

function PredictionComponent(props) {
  const {
    ticker,
    prediction,
    didPredictionLookup,
    handleBackendPredictionLookup,
  } = props;
  const classes = useStyles();

  useEffect(() => {
    if (!didPredictionLookup) {
      apiPredictionLookup(ticker, handleBackendPredictionLookup);
    }
  });

  return prediction !== null ? (
    <div className="mb-1">
      <p>{}</p>
      <Chip
        label={"Predicted Price: $" + prediction.future_value.toFixed(2)}
        className={classes.prediction}
      />
      <Chip
        label={
          "Range: $" +
          prediction.lower_value.toFixed(2) +
          " to $" +
          prediction.upper_value.toFixed(2)
        }
        className={classes.prediction}
      />
      <Chip
        label={"Date: " + prediction.prediction_date}
        className={classes.prediction}
      />
    </div>
  ) : null;
}

const popularStocks = [
  { ticker: "AAPL", company_name: "Apple Inc." },
  { ticker: "TSLA", company_name: "Tesla, Inc." },
  { ticker: "AMZN", company_name: "Amazon.com, Inc." },
  { ticker: "NFLX", company_name: "Netflix, Inc." },
  { ticker: "MSFT", company_name: "Microsoft Corporation" },
];

export function LandingPageComponent(props) {
  const classes = useStyles();
  return (
    <div>
      <Grid container direction="row" xs={12}>
        <Grid container direction="column" xs={6} alignItems="center">
          <Typography variant="h4" className={classes.h4}>
            Stock Prediction - Home
          </Typography>
          <Typography variant="h6" align="center">
            Welcome to the Stock Prediction home page! Here you are able to
            predict the prices of your favorite stocks on the stock market. To
            begin, simply search a company name or stock ticker and hit enter.
          </Typography>
          <Grid item>
            <Card className={classes.landingRoot}>
              <CardMedia
                className={classes.landingMedia}
                component="img"
                image="https://user-images.githubusercontent.com/65428832/115729365-5ba3b300-a353-11eb-81a9-808eebcce8c2.png"
              />
            </Card>
          </Grid>
          <Typography variant="h6" align="center">
            Once your stock has loaded, you have the option to add it to your
            watchlist. After adding it to your watchlist, you can predict the
            stock's price giving you a 30 day forecast, or you can remove it if
            you are no longer interested.
          </Typography>
          <Grid item>
            <Card className={classes.landingRoot}>
              <CardMedia
                className={classes.landingMedia}
                component="img"
                image="https://user-images.githubusercontent.com/65428832/115729385-5fcfd080-a353-11eb-8099-d263f6492f10.png"
              />
            </Card>
          </Grid>
          <Typography variant="h6" align="center">
            Thanks for using our website, we wish you the best of luck in the
            market!
          </Typography>
        </Grid>
        <Grid container direction="column" xs={6} alignItems="center">
          <Typography variant="h4" className={classes.h4}>
            Popular Stocks
          </Typography>
          <StockList newStocks={popularStocks} {...props}></StockList>
        </Grid>
      </Grid>
      <Typography variant="h4" className={classes.h4} align="center">
        Your Tracked Stocks
      </Typography>
    </div>
  );
}

const useStyles = makeStyles({
  root: {
    background: "linear-gradient(180deg, #FE6B8B 30%, #E8A87C 90%)",
    marginTop: "5px",
    marginBottom: "5px",
    borderRadius: "50px",
    width: 425,
  },
  header: {
    textAlign: "center",
  },
  prediction: {
    background: "linear-gradient(180deg, #FE6B8B 30%, #E8A87C 90%)",
    marginLeft: "5px",
  },
  button: {
    backgroundColor: "white",
    color: "black",
    borderRadius: "50px",
  },
  landingRoot: {
    maxWidth: 550,
    textAlign: "center",
    alignItems: "center",
    justifyContent: "center",
    margin: "5px",
  },
  h4: {
    color: "#FE6B8B",
  },
  landingMedia: {
    height: "100%",
    width: "100%",
  },
});
