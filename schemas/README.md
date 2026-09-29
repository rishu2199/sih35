# METROLOGIX-76 — Shared JSON Schemas

This directory contains **language-agnostic JSON Schema contracts** shared between the
Python backend and the TypeScript frontend.

## Purpose

Prevents drift between backend Pydantic models and frontend TypeScript interfaces by
maintaining a single source of truth for API data shapes.

## Structure

```
schemas/
  instruments/
    instrument_spec.schema.json   # InstrumentSpecification contract
  observations/
    observation_point.schema.json # ObservationPoint contract
  reports/
    test_session.schema.json      # TestSession summary contract
```

## Workflow

1. Backend: Pydantic models export JSON Schema via `model.model_json_schema()`.
2. Schemas committed here are the canonical version.
3. Frontend: TypeScript types are generated from these schemas using `json-schema-to-ts`
   or validated at runtime via `zod`.
