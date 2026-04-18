import { config, fields, collection } from "@keystatic/core";

export default config({
  storage: {
    kind: "local",
  },
  ui: {
    brand: { name: "research.juanlentino.com" },
  },
  collections: {
    provenance: collection({
      label: "Provenance notes",
      path: "content/provenance/*",
      slugField: "slug",
      format: { contentField: "body" },
      schema: {
        title: fields.text({
          label: "Title",
          validation: { length: { min: 1, max: 200 } },
        }),
        slug: fields.slug({
          name: {
            label: "Slug",
            description: "URL slug. Must match filename.",
            validation: { length: { min: 2, max: 80 } },
          },
        }),
        topic: fields.text({
          label: "Topic",
          defaultValue: "provenance",
          validation: { length: { min: 1 } },
        }),
        date_published: fields.date({
          label: "Date published",
          validation: { isRequired: true },
        }),
        date_updated: fields.date({
          label: "Date updated",
          validation: { isRequired: true },
        }),
        author: fields.text({
          label: "Author",
          defaultValue: "Juan Lentino",
          validation: { length: { min: 1 } },
        }),
        orcid: fields.text({
          label: "ORCID",
          defaultValue: "0009-0006-8151-5920",
          validation: {
            length: { min: 19, max: 19 },
            pattern: {
              regex: /^\d{4}-\d{4}-\d{4}-\d{3}[\dX]$/,
              message: "ORCID must match 0000-0000-0000-0000",
            },
          },
        }),
        license: fields.select({
          label: "License",
          options: [
            { label: "CC BY 4.0", value: "CC-BY-4.0" },
            { label: "CC BY-SA 4.0", value: "CC-BY-SA-4.0" },
            { label: "CC0 1.0", value: "CC0-1.0" },
          ],
          defaultValue: "CC-BY-4.0",
        }),
        doi: fields.text({
          label: "DOI",
          description: "Zenodo DOI, e.g. 10.5281/zenodo.XXXXXXX. Leave blank until minted.",
        }),
        canonical_url: fields.url({
          label: "Canonical URL",
          description:
            "https://research.juanlentino.com/<topic>/<slug>/ — required for Scholar indexing.",
          validation: { isRequired: true },
        }),
        pdf_url: fields.url({
          label: "PDF URL",
          description: "Link to the Zenodo-hosted PDF snapshot.",
        }),
        abstract: fields.text({
          label: "Abstract",
          multiline: true,
          validation: { length: { min: 40, max: 1600 } },
        }),
        keywords: fields.array(
          fields.text({
            label: "Keyword",
            validation: { length: { min: 1, max: 60 } },
          }),
          {
            label: "Keywords",
            itemLabel: (p) => p.value,
            validation: { length: { min: 2, max: 12 } },
          },
        ),
        version: fields.integer({
          label: "Version",
          defaultValue: 1,
          validation: { min: 1 },
        }),
        status: fields.select({
          label: "Status",
          options: [
            { label: "Published", value: "published" },
            { label: "Retracted", value: "retracted" },
          ],
          defaultValue: "published",
        }),
        changelog: fields.array(
          fields.object({
            date: fields.date({ label: "Date", validation: { isRequired: true } }),
            change: fields.text({ label: "Change", validation: { length: { min: 1 } } }),
          }),
          {
            label: "Changelog",
            itemLabel: (p) => `${p.fields.date.value} — ${p.fields.change.value}`,
          },
        ),
        body: fields.mdx({
          label: "Body",
          options: {
            image: false,
          },
        }),
      },
    }),
  },
});
