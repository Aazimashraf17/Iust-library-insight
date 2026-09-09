# IUST Library Insights

An interactive Data Science dashboard for understanding which library books are borrowed most, which titles have unmet demand, and how a limited acquisition budget can be allocated more effectively.

**Live demo:** https://iust-library-insight.vercel.app

## What the project does

- Searches and filters the collection by title, author, and category.
- Calculates a demand score from circulation, availability, and waiting-list pressure.
- Visualizes category demand and monthly borrowing momentum.
- Identifies high-demand and low-demand titles.
- Recommends additional copies within a user-selected purchase budget.
- Includes a realistic sample CSV that can later be replaced with official library data.

## Tech stack

- Next.js and React
- TypeScript
- Tailwind CSS
- Recharts
- Shadcn UI components

## Run locally

Requirements: Node.js 22.13 or newer.

~~~bash
git clone https://github.com/Aazimashraf17/Iust-library-insight.git
cd Iust-library-insight
npm install
npm run dev
~~~

Then open the local address shown in the terminal.

## Data fields

The sample dataset is available at **public/data/library_books.csv**.

| Field | Meaning |
| --- | --- |
| title | Book title |
| author | Author name |
| category | Subject group |
| copies | Copies owned by the library |
| borrowings | Total checkouts during the study period |
| available | Copies currently available |
| waiting | Students on the waiting list |
| price_inr | Estimated purchase price per copy |

## Demand score

The demonstration model combines three signals:

1. Borrowings per copy, which measures circulation intensity.
2. The share of copies currently checked out, which measures utilization.
3. Waiting-list size, which measures unmet demand.

Scores are capped at 100 and grouped as low, moderate, or high demand. The formula is transparent and can be tuned after the library validates the relative importance of each factor.

## Use real library data

1. Export anonymized circulation data from the library system.
2. Match it to the CSV fields above.
3. Remove all student names, registration numbers, and other personal information.
4. Replace the records in **data/library-books.ts** and the downloadable CSV.
5. Rebuild the project and verify the recommendations with library staff.

## Suggested next improvements

- Read records directly from an uploaded CSV.
- Compare semesters and academic departments.
- Add forecasting for next-semester demand.
- Connect to an anonymized library database.
- Validate recommendations with librarians and students.

## Responsible use

The included records are fictional sample data for demonstration. Purchase decisions should use verified circulation records and professional librarian judgment. Do not upload personally identifiable borrowing histories.

## Author

Aazim Ashraf — Data Science student at Islamic University of Science and Technology.

## License

This project is available under the MIT License.
