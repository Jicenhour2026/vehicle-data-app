
import axios from "axios";

export default async function handler(req, res) {
  try {
    const { vin } = req.query;
    if (!vin) {
      return res.status(400).json({ error: "VIN required" });
    }

    // Decode VIN using NHTSA (free)
    const vinRes = await axios.get(
      `https://vpic.nhtsa.dot.gov/api/vehicles/decodevinvalues/${vin}?format=json`
    );

    const v = vinRes.data.Results[0];

    res.status(200).json({
      vehicle: {
        year: v.ModelYear,
        make: v.Make,
        model: v.Model,
        engine: v.EngineModel || "Unknown"
      },
      maintenance: [
        { interval: "5,000 miles", service: "Oil & filter change" },
        { interval: "30,000 miles", service: "Brake inspection" }
      ],
      tires: {
        front: "225/65R17",
        rear: "225/65R17"
      },
      oil: {
        type: "5W-30",
        capacity: "5.7 quarts"
      },
      wheelTorque: "100 ft-lbs"
    });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
``
