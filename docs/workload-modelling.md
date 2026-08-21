# Workload Modelling

A realistic workload describes _when, how often, and in what sequence_ customers perform business
actions. “100 VUs” alone provides none of that context.

## Core dimensions

| Dimension        | Question                                                |
| ---------------- | ------------------------------------------------------- |
| Concurrent users | How many active sessions overlap?                       |
| Arrival rate     | How many new journeys or requests begin per time unit?  |
| Think time       | How long do people pause between actions?               |
| Session reuse    | Is authentication performed once or on every call?      |
| Journey mix      | What share browse, search, checkout, or look up orders? |
| Peak shape       | Is traffic steady, ramped, seasonal, or sudden?         |
| Data cardinality | Are accounts/products shared or unique?                 |
| Geography        | Where are users and dependencies located?               |

## Derivation

Use production analytics, gateway logs, business forecasts, campaign schedules, and operational
knowledge. Remove bots/health checks unless they genuinely consume capacity. Convert transaction
counts to peak-period rates, then map rates to journeys. Record any assumption where evidence is
missing and run sensitivity tests around it.

The bundled 45/20/15/10/7/3 commerce mix is a transparent portfolio hypothesis. Modify
`framework/config/workload-models.js` only after documenting the replacement evidence.

## Closed vs open models

VU executors are closed models: a VU starts its next iteration after completing and thinking, so slow
responses reduce generated throughput. Arrival-rate executors are open models: new iterations begin
at the required rate and expose queueing more directly. Use both according to the production traffic
source; monitor dropped iterations and generator saturation in open models.

## Think time and authentication

Variable 1–3 second think time prevents unrealistic synchronous hammering in human journeys.
Per-VU login reflects a session-based client. Authentication load is a separate scenario because
measuring token issuance and measuring logged-in commerce traffic answer different questions.

## Comparability checklist

Do not compare results unless code, environment, data volume, cache warm-up, topology, dependency
behaviour, workload mix, profile, duration, and generator placement are equivalent or the difference
is explicitly the experimental variable.
