
# Schema Pack CSV Files

This directory contains the CSV files that are converted to the schema pack JSON at build time.

## Required Files

1. **leadership-primary.csv** - Primary leadership schema data
2. **leadership-secondary.csv** - Secondary leadership schema data  
3. **clinical-primary.csv** - Primary clinical schema data
4. **clinical-secondary.csv** - Secondary clinical schema data

## CSV Format

All CSV files must have a `schema_id` column as the primary key. Additional columns can contain any schema-specific data.

### Example structure:
```csv
schema_id,unmet_need,surrender_behavior,avoidance_behavior,...
punitive_controller,"Need for Control","Withdrawal","Aggression",...
clinger,"Need for Connection","Dependency","Anxiety",...
```

## Build Process

Run the build script to convert CSVs to schema-pack.json:

```bash
yarn build-schema-pack
```

This generates `data/schema-pack.json` which is used at runtime.

## Integration

The schema pack is loaded in the coaching hub to resolve client primary/secondary schemas and populate the Leadership and Clinical framework accordions with schema-specific data.
