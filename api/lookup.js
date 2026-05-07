
import axios from "axios";

/* ---------- VIN Decode ---------- */
async function decodeVIN(vin) {
  const res = await axios.get(
    `https://vpic.nhtsa.dot.gov/api/vehicles/decodevinvalues/${vin}?format=json`
  );
  const v = res.data.Results[0];

  return {
    year: v.ModelYear,
    make: v.Make,
    model: v.Model,
    engine: v.EngineModel || null
  };
}

/* ---------- Maintenance ---------- */
async function getMaintenanceSchedule(vehicle) {
  const res = await axios.get(
    "https://api.vehicledatabases.com/maintenance",
    {
      headers: { "X-API-Key": process.env.MAINTENANCE_API_KEY },
      params: {
        year: vehicle.year,
        make: vehicle.make,
        model: vehicle.model
      }
    }
  );

  return res.data.schedules.map(s => ({
    interval: `${s.interval_miles} miles`,
    services: s.services
  }));
}

/* ---------- Tires ---------- */
async function getTireSpecs(vehicle) {
  const res = await axios.get(
    "https://api.411vehicledata.com/v1/tires",
    {
      headers: { "X-API-Key": process.env.TIRE_API_KEY },
      params: {
        year: vehicle.year,
        make: vehicle.make,
        model: vehicle.model
      }
    }
  );

  return {
    front: res.data.front_tire,
    rear: res.data.rear_tire,
    wheelDiameter: res.data.wheel_diameter || null
  };
}

/* ---------- Oil & Torque ---------- */
async function getOilAndTorque(vehicle) {
  const res = await axios.get(
    "https://api.openlaborproject.com/v1/fluids",
    {
      headers: { "X-API-Key": process.env.OIL_TORQUE_API_KEY },
      params: {
        year: vehicle.year,
        make: vehicle.make,
        model: vehicle.model,
        engine: vehicle.engine
      }
    }
  );

  return {
    oil: {
      type: res.data.oil_viscosity,
      capacity: res.data.oil_capacity
    },
    torque: {
      lugNuts: res.data.lug_nut_torque
    }
  };
}

/* ---------- Main Handler ---------- */
export default async function handler(req, res) {
  try {
    const { vin, year, make, model } = req.query;

    let vehicle;

    if (vin) {
      vehicle = await decodeVIN(vin);
    } else if (year && make && model) {
      vehicle = { year, make, model };
    } else {
      return res.status(400).json({
        error: "Provide either VIN or Year, Make, and Model"
      });
    }

    const [maintenance, tires, oilAndTorque] = await Promise.all([
      getMaintenanceSchedule(vehicle),
      getTireSpecs(vehicle),
      getOilAndTorque(vehicle)
    ]);

    res.status(200).json({
      vehicle,
      maintenance,
      tires,
      oil: oilAndTorque.oil,
      torque: oilAndTorque.torque
    });

  } catch (err) {
    res.status(500).json({
      error: "Lookup failed",
      detail: err.message
    });
  }
}
