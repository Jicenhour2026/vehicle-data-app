
import axios from "axios";

export default async function handler(req, res) {
  try {
    const { vin, year, make, model } = req.query;

    let vehicle;

    if (vin) {
      const r = await axios.get(
        `https://vpic.nhtsa.dot.gov/api/vehicles/decodevinvalues/${vin}?format=json`
      );
      const v = r.data.Results[0];
      vehicle = {
        year: v.ModelYear,
        make: v.Make,
        model: v.Model,
        engine: v.EngineModel || "Unknown"
      };
    } else if (year && make && model) {
      vehicle = { year, make, model, engine: "Unknown" };
    } else {
      return res.status(400).json({
        error: "Provide VIN or Year/Make/Model"
      });
    }

    // ✅ Safe mock data (app never crashes)
    res.status(200).json({
      vehicle,
      maintenance: [
        { interval: "5,000 miles", services: ["Oil change", "Tire rotation"] },
        { interval: "30,000 miles", services: ["Brake inspection"] }
      ],
      tires: {
        front: "225/65R17",
        rear: "225/65R17"
      },
      oil: {
        type: "5W‑30",
        capacity: "5 quarts"
      },
      torque: {
        lugNuts: "100 ft‑lbs"
      }
    });

  } catch (e) {
    res.status(500).json({
      error: "Server error",
      detail: e.message
    });
  }
}
