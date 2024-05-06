# Helpers

When creating a **Section**, you can use our helpers components `Uptitle`, `Title` and `Introduction`. These will automatically create a `RichText` with the correct settings on the WP Editor, and set the tag and classname on the frontend.

## Usage

### On `edit.tsx`:

```tsx
<SectionEdit.Uptitle
  attribute={uptitle}
  onChange={(uptitle: string) =>
    props.setAttributes({ uptitle })
  }
/>
<SectionEdit.Title
  attribute={title}
  onChange={(title: string) =>
    props.setAttributes({ title })
  }
/>
<SectionEdit.Introduction
  attribute={introduction}
  onChange={(introduction: string) =>
    props.setAttributes({ introduction })
  }
/>
```

### On `index.tsx`:

```tsx
<Section.Uptitle text={uptitle} />
<Section.Title text={title} />
<Section.Introduction text={introduction} />
```
