
export default async function handler(req, res) {
  try {
    const vin = req.query.vin;

    if (!vin) {
      return res.status(400).json({ error: "VIN is required" });
    }

    const r = await fetch(
      `https://vpic.nhtsa.dot.gov/api/vehicles/decodevinvalues/${vin}?format=json`
    );

    const data = await r.json();
    const v = data.Results[0];

    return res.status(200).json({
      vehicle: {
        vin,
        year: v.ModelYear,
        make: v.Make,
        model: v.Model,
        body: v.BodyClass
      },

      maintenance: [
        "Oil & filter change every 5,000 miles",
        "Tire rotation every 5,000 miles",
        "Brake inspection every 10,000 miles",
        "Engine & cabin air filter inspection"
      ],

      tires: {
        note: "Tire size varies by trim and wheel option",
        commonSizes: [
          "245/65R17",
          "255/70R16",
          "265/65R18"
        ]
      },

      oil: {
        type: "5W‑30 (most gasoline engines)",
        capacity: "5–6 quarts (varies by engine)"
      },

      wheelTorque: {
        lugNutTorque: "95–115 ft‑lb (typical for light trucks & SUVs)"
      }
    });

  } catch (e) {
    return res.status(500).json({
      error: "Server error",
      detail: String(e)
    });
  }
}
``
