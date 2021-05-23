const { getTrips, getDriver } = require('api');

/**
 * This function should return the trip data analysis
 *
 * Question 3
 * @returns {any} Trip data analysis
 */

async function analysis() {
  let cashTrips = 0;
  let nonCashTrips = 0;
  const arr = await getTrips();

  arr.forEach((trip) => {
    trip.isCash === true ? cashTrips++ : nonCashTrips++;
  });
  const billedTotal = getBilledTotal(arr);
  const cashBillTotal = getCashBillTotal(arr);
  const nonCashBillTotal = getNonCashBillTotal(arr);

  const allDrivers = getAllDrivers(arr);
  const noOfDriversWithMoreThanOneVehicle = await noOfDriversWithTripsMoreThanOne(
    allDrivers
  );

  const mostTripsByDriver = await mostTripsByDrivers(arr);
  const highestEarningDriver = await getHighestEarningDriver(arr);

  // console.log(typeof Number(billedTotal.toFixed(2)))

  const result = {
    noOfCashTrips: cashTrips,
    noOfNonCashTrips: nonCashTrips,
    billedTotal: Number(billedTotal.toFixed(2)),
    cashBilledTotal: Number(cashBillTotal.toFixed(2)),
    nonCashBilledTotal: Number(nonCashBillTotal.toFixed(2)),
    noOfDriversWithMoreThanOneVehicle,
    mostTripsByDriver,
    highestEarningDriver,
  };

  return result;
}
const getBilledTotal = (arr) => {
  let total = 0;
  arr.forEach((el) => {
    total =
      +JSON.parse(JSON.stringify(el.billedAmount).split(',').join('')) + total;
  });
  return total;
};

const getCashBillTotal = (arr) => {
  let total = 0;
  arr.forEach((el) => {
    el.isCash === true
      ? (total =
          +JSON.parse(JSON.stringify(el.billedAmount).split(',').join('')) +
          total)
      : (total = total);
  });
  return total;
};

const getNonCashBillTotal = (arr) => {
  let total = 0;
  arr.forEach((el) => {
    el.isCash === false
      ? (total =
          +JSON.parse(JSON.stringify(el.billedAmount).split(',').join('')) +
          total)
      : (total = total);
  });
  return total;
};

const getAllDrivers = (array) => {
  let driversArray = [];
  array.forEach((trip) => {
    driversArray.push(trip.driverID);
  });

  const uniqueDrivers = driversArray.filter((driver, position) => {
    return driversArray.indexOf(driver) == position;
  });

  return uniqueDrivers;
};

const noOfDriversWithTripsMoreThanOne = async (driversArray) => {
  const allDriver = driversArray.map(async (driver) => {
    try {
      const driverDetails = await getDriver(driver);
      if (driverDetails) return driverDetails;
    } catch (error) {}
  });

  let allNewDrivers = await Promise.all(allDriver);
  allNewDrivers = allNewDrivers.filter(Boolean);

  let count = 0;
  allNewDrivers.forEach((driver) => {
    if (driver.vehicleID.length > 1) {
      count++;
    }
  });
  return count;
};

const getTotalAmountEarned = (arr) => {
  let total = 0;
  arr.forEach((el) => {
    total =
      +JSON.parse(JSON.stringify(el.billedAmount).split(',').join('')) + total;
  });
  return total;
};

const mostTripsByDrivers = async (trips) => {
  const driversArray = [];

  // creates an object to get no of trips of all drivers
  const driversObject = trips.reduce((tally, driver) => {
    tally[driver.driverID] = (tally[driver.driverID] || 0) + 1;
    return tally;
  }, {});

  // get max in object
  const result = Math.max(...Object.values(driversObject));
  //convert object to array
  const x = Object.entries(driversObject);
  const newX = x.filter((driver) => driver[1] === result);

  const allDriverPromise = newX.map(async (driver) => {
    try {
      const driverDetails = await getDriver(driver[0]);
      driverDetails.id = driver[0];
      if (driverDetails) return driverDetails;
    } catch (error) {}
  });

  const allDriver = await Promise.all(allDriverPromise);

  const driversTrips = trips.filter(
    (driver) => driver.driverID === allDriver[0].id
  );
  const driversBill = getTotalAmountEarned(driversTrips);
  return {
    name: allDriver[0].name,
    email: allDriver[0].email,
    phone: allDriver[0].phone,
    noOfTrips: result,
    totalAmountEarned: driversBill,
  };
};

// +JSON.parse(JSON.stringify(el.billedAmount).split(',').join(''))

const getHighestEarningDriver = async (trips) => {
  // creates an object to get no of trips of all drivers
  let driversObject = trips.reduce((tally, driver) => {
    const bill = +JSON.parse(
      JSON.stringify(driver.billedAmount).split(',').join('')
    );
    tally[driver.driverID] = (tally[driver.driverID] || 0) + bill;
    // tally[trip] = (tally[trip] || 0) + 1;
    return tally;
  }, {});

  // creates an object to get no of trips of all drivers
  const driversTripsObject = trips.reduce((tally, driver) => {
    tally[driver.driverID] = (tally[driver.driverID] || 0) + 1;
    return tally;
  }, {});

  for (const property in driversObject) {
    driversObject[property] = Number(driversObject[property].toFixed(2));
  }

  const maxBill = Math.max(...Object.values(driversObject));
  const driversIdBillArray = Object.entries(driversObject);
  const maxDriver = driversIdBillArray.filter((driver) => driver[1] === maxBill);

  const noOfTrips = driversTripsObject[maxDriver[0][0]];
  const driver = await getDriver(maxDriver[0][0]);

  const highestEarningDriver = {
    name: driver.name,
    email: driver.email,
    phone: driver.phone,
    noOfTrips,
    totalAmountEarned: maxBill,
  };

  return highestEarningDriver;
};

// console.log(await analysis());

module.exports = analysis;
