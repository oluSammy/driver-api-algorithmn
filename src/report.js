const { getTrips, getDriver, getVehicle } = require('api');
// const { getAllDrivers }  = require('./analysis');

/**
 * This function should return the data for drivers in the specified format
 *
 * Question 4
 *
 * @returns {any} Driver report data
 */
async function driverReport() {
  const trips = await getTrips();
  const drivers = getAllDrivers(trips);
  const allDriversDetails = await getDriverSDetail(drivers);
  const driversNoOfTrips = getNofOfTrips(allDriversDetails, trips);
  const result = await getVehicleDetails(driversNoOfTrips);

  return result;
}

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

const getDriverSDetail = async (driversArr) => {
  const allDriversPromise = driversArr.map(async (driverID) => {
    try {
      const driver = await getDriver(driverID);
      driver.noOfVehicles = driver.vehicleID.length;
      driver.vehicleId = driver.vehicleID;
      driver.id = driverID;
      if (driver) return driver;
    } catch (error) {}
  });

  let allDrivers = await Promise.all(allDriversPromise);
  allDrivers = allDrivers.filter(Boolean);

  let result = [];

  allDrivers.forEach((driver) => {
    const newDriver = {
      name: driver.name,
      id: driver.id,
      phone: driver.phone,
      noOfVehicles: driver.noOfVehicles,
      vehicleId: driver.vehicleId,
    };
    result.push(newDriver);
  });

  return result;
};

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

const getNofOfTrips = (driversArray, tripsArray) => {
  const getTrips = driversArray.map((driver) => {
    let arrayOfTrips = tripsArray.filter((trip) => trip.driverID === driver.id);
    driver.arrayOfTrips = arrayOfTrips;
    driver.noOfTrips = arrayOfTrips.length;

    driver.noOfCashTrips = arrayOfTrips.filter((trip) => trip.isCash).length;
    driver.noOfNonCashTrips = arrayOfTrips.filter(
      (trip) => !trip.isCash
    ).length;
    driver.totalAmountEarned = Number(getBilledTotal(arrayOfTrips).toFixed(2));
    driver.totalCashAmount = Number(getCashBillTotal(arrayOfTrips).toFixed(2));
    driver.totalNonCashAmount = Number(
      getNonCashBillTotal(arrayOfTrips).toFixed(2)
    );
    driver.trips = arrayOfTrips.map((trip) => {
      let obj = {};
      obj.name = trip.user.name;
      obj.created = trip.created;
      obj.pickup = trip.pickup.address;
      obj.destination = trip.destination.address;
      obj.billed = +JSON.parse(
        JSON.stringify(trip.billedAmount).split(',').join('')
      );
      obj.isCash = trip.isCash;

      return obj;
    });

    return driver;
  });
  return getTrips;
};

const getVehicleDetails = async (allDrivers) => {
  const allNewRiversPromise = allDrivers.map(async (driver) => {
    const driverVehicles = driver.vehicleId;
    const vehicleArrayPromise = driverVehicles.map(async (id) => {
      const vehicle = await getVehicle(id);
      return vehicle;
    });

    const newVehicles = await Promise.all(vehicleArrayPromise);

    return { ...driver, vehicleArray: newVehicles };
  });

  const result = await Promise.all(allNewRiversPromise);

  const allNewDrivers = result.map((driver) => {
    let vehicles = [];
    driver.vehicleArray.forEach((el) => {
      vehicles.push({ plate: el.plate, manufacturer: el.manufacturer });
    });
    delete driver.arrayOfTrips;
    delete driver.vehicleArray;
    return { ...driver, vehicles };
  });

  return allNewDrivers;
};

module.exports = driverReport;
