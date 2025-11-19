## Tenders Feedback Dashboard

This repository contains a single React component – `TendersFeedbackDashboard` – that mirrors the approved Figma design for the tender feedback view. It is intentionally minimal so Figma Code Connect (Dev Mode) can map the design directly to production-ready JSX without pulling in the entire STU platform.

### Project structure

```
src/
  components/
    tenders/
      TendersFeedbackDashboard.tsx
```

### Usage

Install dependencies and run a quick type-check:

```bash
npm install
npm run typecheck
```

Import the component into any React/Next.js project:

```tsx
import TendersFeedbackDashboard from "./src/components/tenders/TendersFeedbackDashboard";

export default function Example() {
  return (
    <TendersFeedbackDashboard
      fullName="Lisa Terry"
      phoneNumber="+44 7700 900123"
      emailAddress="lisa.terry@stu.com"
      comments="Overall a strong submission. Please expand on sustainability."
      attachments={["pricing-schedule.pdf", "method-statement.docx"]}
      splits={[
        { id: "quality", description: "Quality & Methodology", percentage: 35 },
        { id: "price", description: "Commercial / Price", percentage: 40 },
        { id: "social", description: "Social value", percentage: 25 },
      ]}
      onEditFeedback={() => console.log("Open modal…")}
    />
  );
}
```

### Figma Code Connect

1. Push updates to `main` on `STUADMIN/STU-FIGMA-FILES`.
2. In Figma Dev Mode choose **Library → Connect components to code**.
3. Point the GitHub connection at this repository and map the `TendersFeedbackDashboard.tsx` file to the corresponding design component.

That’s it – designers now see the exact production code snippet whenever they inspect the dashboard component in Figma.


