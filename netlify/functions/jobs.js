// This runs on Netlify's server, NOT in the browser — so the API keys stay hidden.
exports.handler = async function (event) {
  const { what = "", where = "" } = event.queryStringParameters || {};

  const appId = process.env.ADZUNA_APP_ID;
  const appKey = process.env.ADZUNA_APP_KEY;

  const url = `https://api.adzuna.com/v1/api/jobs/us/search/1?app_id=${appId}&app_key=${appKey}&results_per_page=20&what=${encodeURIComponent(what)}&where=${encodeURIComponent(where)}&content-type=application/json`;

  try {
    const res = await fetch(url);
    const data = await res.json();
    const jobs = (data.results || []).map(j => ({
      title: j.title,
      co: j.company?.display_name || "Unknown",
      loc: j.location?.display_name || "USA",
      cat: j.category?.label || "General",
      pay: j.salary_min ? `$${Math.round(j.salary_min).toLocaleString()}+` : "Not listed",
      url: j.redirect_url
    }));
    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
      body: JSON.stringify(jobs)
    };
  } catch (err) {
    return { statusCode: 500, body: JSON.stringify({ error: "Could not fetch jobs" }) };
  }
};
