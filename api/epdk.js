export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  res.setHeader("Cache-Control", "no-store");
  res.setHeader("Content-Type", "application/json; charset=utf-8");

  if (req.method === "OPTIONS") {
    return res.status(204).end();
  }

  const https = await import("https");

  function epdkRequest(bodyValue, label) {
    return new Promise((resolve) => {
      const body = bodyValue;
      const headers = {
        "Accept": "application/json,text/plain,*/*",
        "Content-Type": "application/json",
        "Content-Length": Buffer.byteLength(body),
        "User-Agent": "MolaVolt/1.0"
      };

      const options = {
        hostname: "apigateway.epdk.gov.tr",
        path: "/sarjIstasyonlari/",
        method: "GET",
        headers,
        timeout: 45000
      };

      const request = https.request(options, (response) => {
        let data = "";

        response.on("data", chunk => {
          data += chunk;
        });

        response.on("end", () => {
          let json = null;
          try {
            json = JSON.parse(data);
          } catch (e) {}

          resolve({
            label,
            statusCode: response.statusCode || 500,
            raw: data,
            json
          });
        });
      });

      request.on("timeout", () => {
        request.destroy(new Error("EPDK timeout"));
      });

      request.on("error", (error) => {
        resolve({
          label,
          statusCode: 502,
          raw: JSON.stringify({
            ok: false,
            error: "EPDK bağlantı hatası",
            detail: error.message
          }),
          json: null
        });
      });

      request.write(body);
      request.end();
    });
  }

  function getRows(json) {
    if (!json) return [];

    if (Array.isArray(json)) return json;

    if (Array.isArray(json.result)) return json.result;

    if (json.result && Array.isArray(json.result.rows)) return json.result.rows;

    if (json.data && Array.isArray(json.data)) return json.data;

    if (json.data && Array.isArray(json.data.result)) return json.data.result;

    return [];
  }

  function hasData(r) {
    const rows = getRows(r.json);
    if (rows.length > 0) return true;
    if (r.json && typeof r.json.numRows === "number" && r.json.numRows > 0) return true;
    return false;
  }

  const attempts = [
    {
      label: "GET body boş obje",
      body: "{}"
    },
    {
      label: "GET body boş string",
      body: JSON.stringify("")
    },
    {
      label: "GET body string obje",
      body: JSON.stringify("{}")
    },
    {
      label: "GET body null alanlar",
      body: JSON.stringify({
        lisansNo: null,
        sarjIstasyonuAdi: null,
        sarjIstasyonuNo: null,
        markaAdi: null,
        yesilSarjIstasyonuMu: null,
        hizmetSekli: null
      })
    },
    {
      label: "GET body boş alanlar",
      body: JSON.stringify({
        lisansNo: "",
        sarjIstasyonuAdi: "",
        sarjIstasyonuNo: "",
        markaAdi: "",
        yesilSarjIstasyonuMu: "",
        hizmetSekli: ""
      })
    }
  ];

  const logs = [];

  for (const attempt of attempts) {
    const r = await epdkRequest(attempt.body, attempt.label);

    logs.push({
      label: r.label,
      statusCode: r.statusCode,
      numRows: r.json && typeof r.json.numRows === "number" ? r.json.numRows : getRows(r.json).length,
      sample: r.raw.slice(0, 300)
    });

    if (r.statusCode === 200 && hasData(r)) {
      return res.status(200).send(r.raw);
    }
  }

  return res.status(502).send(JSON.stringify({
    ok: false,
    error: "EPDK bağlantısı çalıştı ama veri dönmedi",
    note: "Tüm GET body formatları denendi. EPDK geçici kota/boş cevap dönmüş olabilir.",
    attempts: logs
  }, null, 2));
}
