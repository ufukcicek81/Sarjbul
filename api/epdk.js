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
      const hasBody = bodyValue !== undefined && bodyValue !== null;
      const body = hasBody ? bodyValue : "";

      const headers = {
        "Accept": "application/json,text/plain,*/*",
        "User-Agent": "MolaVolt/1.0"
      };

      if (hasBody) {
        headers["Content-Type"] = "application/json";
        headers["Content-Length"] = Buffer.byteLength(body);
      }

      const options = {
        hostname: "apigateway.epdk.gov.tr",
        path: "/sarjIstasyonlari/",
        method: "GET",
        headers,
        timeout: 30000
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
          raw: "",
          json: {
            ok: false,
            error: "EPDK bağlantı hatası",
            detail: error.message
          }
        });
      });

      if (hasBody) request.write(body);
      request.end();
    });
  }

  function rowCount(r) {
    if (!r || !r.json) return 0;
    if (Array.isArray(r.json.result)) return r.json.result.length;
    if (typeof r.json.numRows === "number") return r.json.numRows;
    if (Array.isArray(r.json)) return r.json.length;
    return 0;
  }

  const attempts = [];

  const noBody = await epdkRequest(undefined, "GET gövdesiz");
  attempts.push({
    label: noBody.label,
    statusCode: noBody.statusCode,
    numRows: rowCount(noBody),
    sample: noBody.raw.slice(0, 250)
  });
  if (noBody.statusCode === 200 && rowCount(noBody) > 0) {
    return res.status(200).send(noBody.raw);
  }

  const emptyObject = await epdkRequest("{}", "GET body {}");
  attempts.push({
    label: emptyObject.label,
    statusCode: emptyObject.statusCode,
    numRows: rowCount(emptyObject),
    sample: emptyObject.raw.slice(0, 250)
  });
  if (emptyObject.statusCode === 200 && rowCount(emptyObject) > 0) {
    return res.status(200).send(emptyObject.raw);
  }

  const brands = [
    "ZES",
    "Eşarj",
    "Trugo",
    "Sharz",
    "Voltrun",
    "Ovolt",
    "Oncharge",
    "WAT",
    "Tesla",
    "Astor",
    "Gio",
    "Beefull"
  ];

  const mergedRows = [];
  let columnNames = null;

  for (const markaAdi of brands) {
    const body = JSON.stringify({ markaAdi });
    const r = await epdkRequest(body, `markaAdi=${markaAdi}`);

    attempts.push({
      label: r.label,
      statusCode: r.statusCode,
      numRows: rowCount(r),
      sample: r.raw.slice(0, 180)
    });

    if (r.statusCode === 200 && r.json) {
      if (Array.isArray(r.json.columnNames)) columnNames = r.json.columnNames;

      if (Array.isArray(r.json.result)) {
        mergedRows.push(...r.json.result);
      } else if (Array.isArray(r.json)) {
        mergedRows.push(...r.json);
      }
    }
  }

  const seen = new Set();
  const uniqueRows = mergedRows.filter(row => {
    const key = JSON.stringify(row);
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });

  if (uniqueRows.length > 0) {
    return res.status(200).send(JSON.stringify({
      statusCode: 200,
      statusDescription: "OK",
      message: "MolaVolt marka bazlı EPDK sorgusu",
      columnNames,
      numRows: uniqueRows.length,
      result: uniqueRows,
      attempts,
      errors: []
    }));
  }

  return res.status(502).send(JSON.stringify({
    ok: false,
    error: "EPDK bağlantısı çalıştı ama veri dönmedi",
    note: "Gövdesiz, boş obje ve marka bazlı denemeler yapıldı.",
    attempts
  }, null, 2));
}
