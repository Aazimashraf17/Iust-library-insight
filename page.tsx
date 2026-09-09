"use client";

import { useMemo, useState } from "react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  BookOpen,
  Boxes,
  Download,
  IndianRupee,
  LibraryBig,
  Search,
  TrendingUp,
  Users,
  type LucideIcon,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { books, monthlyBorrowing, type BookRecord } from "@/data/library-books";

const inr = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});

function getDemandScore(book: BookRecord) {
  const circulation = (book.borrowings / Math.max(book.copies, 1)) * 2.4;
  const occupancy =
    ((book.copies - book.available) / Math.max(book.copies, 1)) * 22;
  const waitPressure = book.waiting * 7;
  return Math.min(100, Math.round(circulation + occupancy + waitPressure));
}

function getDemandLabel(score: number) {
  if (score >= 78) return "High";
  if (score >= 52) return "Moderate";
  return "Low";
}

function demandClasses(score: number) {
  if (score >= 78)
    return "border-[#ffb648]/30 bg-[#fff1d8] text-[#8a4b00]";
  if (score >= 52)
    return "border-[#64c9c2]/35 bg-[#e7f8f6] text-[#07655f]";
  return "border-slate-200 bg-slate-100 text-slate-600";
}

function DashboardTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: Array<{ dataKey: string; name: string; value: number }>;
  label?: string;
}) {
  if (!active || !payload?.length) return null;

  return (
    <div className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-[#102533] shadow-xl">
      <p className="mb-1 text-xs font-semibold text-slate-500">{label}</p>
      {payload.map((item) => (
        <p key={item.dataKey} className="text-sm font-semibold">
          {item.name}: {item.value}
        </p>
      ))}
    </div>
  );
}

export default function Home() {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All categories");
  const [budget, setBudget] = useState(8000);

  const categories = useMemo(
    () => [
      "All categories",
      ...Array.from(new Set(books.map((book) => book.category))),
    ],
    [],
  );

  const filteredBooks = useMemo(() => {
    const query = search.trim().toLowerCase();
    return books
      .filter(
        (book) =>
          category === "All categories" || book.category === category,
      )
      .filter(
        (book) =>
          !query ||
          book.title.toLowerCase().includes(query) ||
          book.author.toLowerCase().includes(query),
      )
      .sort((a, b) => getDemandScore(b) - getDemandScore(a));
  }, [category, search]);

  const categoryData = useMemo(() => {
    const grouped = new Map<
      string,
      { category: string; borrowings: number; titles: number }
    >();
    filteredBooks.forEach((book) => {
      const current = grouped.get(book.category) ?? {
        category: book.category,
        borrowings: 0,
        titles: 0,
      };
      current.borrowings += book.borrowings;
      current.titles += 1;
      grouped.set(book.category, current);
    });
    return Array.from(grouped.values()).sort(
      (a, b) => b.borrowings - a.borrowings,
    );
  }, [filteredBooks]);

  const recommendations = useMemo(() => {
    const pool = books
      .filter(
        (book) =>
          category === "All categories" || book.category === category,
      )
      .map((book) => ({ ...book, demand: getDemandScore(book) }))
      .filter((book) => book.demand >= 68 || book.waiting > 0)
      .sort(
        (a, b) =>
          (b.demand + b.waiting * 6) / b.price -
          (a.demand + a.waiting * 6) / a.price,
      );

    let remaining = budget;
    const picks: Array<
      (typeof pool)[number] & { quantity: number; cost: number }
    > = [];

    for (const book of pool) {
      const targetQuantity = Math.min(
        3,
        Math.max(1, Math.ceil(book.waiting / 2)),
      );
      const quantity = Math.min(
        targetQuantity,
        Math.floor(remaining / book.price),
      );
      if (quantity > 0) {
        const cost = quantity * book.price;
        picks.push({ ...book, quantity, cost });
        remaining -= cost;
      }
      if (remaining < 450 || picks.length === 5) break;
    }

    return { picks, spend: budget - remaining, remaining };
  }, [budget, category]);

  const stats = useMemo(() => {
    const totalBorrowings = filteredBooks.reduce(
      (sum, book) => sum + book.borrowings,
      0,
    );
    const totalCopies = filteredBooks.reduce(
      (sum, book) => sum + book.copies,
      0,
    );
    const checkedOut = filteredBooks.reduce(
      (sum, book) => sum + (book.copies - book.available),
      0,
    );
    const highest = filteredBooks[0];
    return {
      totalBorrowings,
      utilization: totalCopies
        ? Math.round((checkedOut / totalCopies) * 100)
        : 0,
      highest,
      highDemand: filteredBooks.filter(
        (book) => getDemandScore(book) >= 78,
      ).length,
    };
  }, [filteredBooks]);

  const lowDemandBook = [...filteredBooks].sort(
    (a, b) => getDemandScore(a) - getDemandScore(b),
  )[0];

  return (
    <main className="min-h-screen bg-[#eef3f6] text-[#102533]">
      <div className="mx-auto max-w-[1480px] px-4 py-5 sm:px-6 lg:px-8 lg:py-8">
        <header className="overflow-hidden rounded-[28px] bg-[#092433] text-white shadow-[0_22px_70px_rgba(9,36,51,0.2)]">
          <div className="grid lg:grid-cols-[1fr_auto]">
            <div className="px-6 py-7 sm:px-9 sm:py-9">
              <div className="mb-7 flex items-center gap-3">
                <div className="grid size-11 place-items-center rounded-2xl bg-[#5fe1d3] text-[#092433]">
                  <LibraryBig className="size-6" aria-hidden="true" />
                </div>
                <div>
                  <p className="text-sm font-semibold tracking-wide text-[#9af0e7]">
                    IUST LIBRARY
                  </p>
                  <p className="text-sm text-slate-300">
                    Decision intelligence dashboard
                  </p>
                </div>
              </div>
              <div className="max-w-3xl">
                <p className="mb-3 text-sm font-medium text-[#ffca72]">
                  January–August 2026
                </p>
                <h1 className="text-3xl font-semibold tracking-[-0.04em] sm:text-5xl">
                  Put the right books on the right shelves.
                </h1>
                <p className="mt-4 max-w-2xl text-base leading-7 text-slate-300 sm:text-lg">
                  Explore borrowing patterns, identify unmet demand, and turn a
                  limited purchase budget into evidence-based recommendations.
                </p>
              </div>
            </div>
            <div className="relative min-h-40 border-t border-white/10 bg-[#0d3041] p-6 lg:w-80 lg:border-l lg:border-t-0 lg:p-8">
              <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-[#5fe1d3] via-[#4e91ff] to-[#ffbd59]" />
              <p className="text-sm text-slate-300">Dataset status</p>
              <div className="mt-3 flex items-center gap-2 text-lg font-semibold">
                <span className="size-2.5 rounded-full bg-[#5fe1d3] shadow-[0_0_18px_#5fe1d3]" />
                Sample data loaded
              </div>
              <dl className="mt-7 grid grid-cols-2 gap-5">
                <div>
                  <dt className="text-xs uppercase tracking-wider text-slate-400">
                    Titles
                  </dt>
                  <dd className="mt-1 text-2xl font-semibold">{books.length}</dd>
                </div>
                <div>
                  <dt className="text-xs uppercase tracking-wider text-slate-400">
                    Categories
                  </dt>
                  <dd className="mt-1 text-2xl font-semibold">
                    {categories.length - 1}
                  </dd>
                </div>
              </dl>
              <Button
                asChild
                variant="outline"
                className="mt-7 w-full border-white/20 bg-white/5 text-white hover:bg-white/10 hover:text-white"
              >
                <a href="/data/library_books.csv" download>
                  <Download aria-hidden="true" />
                  Download sample CSV
                </a>
              </Button>
            </div>
          </div>
        </header>

        <section
          aria-label="Filters"
          className="relative z-10 -mt-3 px-2 sm:px-5"
        >
          <div className="grid gap-3 rounded-2xl border border-white/80 bg-white/95 p-3 shadow-[0_16px_50px_rgba(32,60,75,0.1)] backdrop-blur md:grid-cols-[minmax(0,1fr)_250px]">
            <label className="relative block">
              <span className="sr-only">
                Search by book title or author
              </span>
              <Search
                className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400"
                aria-hidden="true"
              />
              <Input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search by title or author…"
                className="h-11 border-0 bg-[#f1f5f7] pl-10 shadow-none focus-visible:ring-[#3e8da1]/25"
              />
            </label>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger
                aria-label="Filter by category"
                className="h-11 w-full border-0 bg-[#f1f5f7] px-4 shadow-none"
              >
                <SelectValue placeholder="Choose a category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((item) => (
                  <SelectItem value={item} key={item}>
                    {item}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </section>

        <section
          aria-label="Library summary"
          className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4"
        >
          <MetricCard
            icon={BookOpen}
            label="Borrowings"
            value={stats.totalBorrowings.toLocaleString("en-IN")}
            note={"Across " + filteredBooks.length + " visible titles"}
            accent="blue"
          />
          <MetricCard
            icon={Users}
            label="Shelf utilization"
            value={stats.utilization + "%"}
            note="Copies currently checked out"
            accent="teal"
          />
          <MetricCard
            icon={TrendingUp}
            label="Highest demand"
            value={stats.highest?.title ?? "No result"}
            note={
              stats.highest
                ? "Demand score " + getDemandScore(stats.highest) + "/100"
                : "Try another filter"
            }
            accent="amber"
            compact
          />
          <MetricCard
            icon={Boxes}
            label="Purchase priorities"
            value={String(stats.highDemand)}
            note="Titles with high demand"
            accent="coral"
          />
        </section>

        <section className="mt-6 grid gap-6 xl:grid-cols-[1.18fr_0.82fr]">
          <Card className="border-0 shadow-[0_15px_45px_rgba(32,60,75,0.08)]">
            <CardHeader className="gap-1 px-5 sm:px-6">
              <CardTitle className="text-xl tracking-tight">
                Demand by category
              </CardTitle>
              <CardDescription>
                Total borrowings for the current filter
              </CardDescription>
            </CardHeader>
            <CardContent className="px-2 pb-1 sm:px-4">
              <div
                className="h-[320px] w-full"
                aria-label="Bar chart of borrowing demand by category"
              >
                {categoryData.length ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={categoryData}
                      margin={{ top: 8, right: 12, left: -18, bottom: 38 }}
                    >
                      <CartesianGrid
                        strokeDasharray="4 4"
                        vertical={false}
                        stroke="#dce5e9"
                      />
                      <XAxis
                        dataKey="category"
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: "#526a77", fontSize: 12 }}
                        angle={-22}
                        textAnchor="end"
                        interval={0}
                      />
                      <YAxis
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: "#718691", fontSize: 12 }}
                      />
                      <Tooltip
                        cursor={{ fill: "#eef7f7" }}
                        content={<DashboardTooltip />}
                      />
                      <Bar
                        dataKey="borrowings"
                        name="Borrowings"
                        fill="#167d8d"
                        radius={[7, 7, 0, 0]}
                        maxBarSize={48}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <EmptyState />
                )}
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 bg-[#0c2b3b] text-white shadow-[0_15px_45px_rgba(9,36,51,0.18)]">
            <CardHeader className="gap-1 px-5 sm:px-6">
              <CardTitle className="text-xl tracking-tight">
                Borrowing momentum
              </CardTitle>
              <CardDescription className="text-slate-300">
                Monthly checkouts across the sample collection
              </CardDescription>
            </CardHeader>
            <CardContent className="px-2 pb-1 sm:px-4">
              <div
                className="h-[320px] w-full"
                aria-label="Area chart of monthly library borrowings"
              >
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart
                    data={monthlyBorrowing}
                    margin={{ top: 12, right: 12, left: -20, bottom: 8 }}
                  >
                    <defs>
                      <linearGradient
                        id="borrowGradient"
                        x1="0"
                        y1="0"
                        x2="0"
                        y2="1"
                      >
                        <stop
                          offset="0%"
                          stopColor="#5fe1d3"
                          stopOpacity={0.5}
                        />
                        <stop
                          offset="100%"
                          stopColor="#5fe1d3"
                          stopOpacity={0.02}
                        />
                      </linearGradient>
                    </defs>
                    <CartesianGrid
                      strokeDasharray="4 4"
                      vertical={false}
                      stroke="#294858"
                    />
                    <XAxis
                      dataKey="month"
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: "#adc0ca", fontSize: 12 }}
                    />
                    <YAxis
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: "#839da9", fontSize: 12 }}
                    />
                    <Tooltip content={<DashboardTooltip />} />
                    <Area
                      type="monotone"
                      dataKey="borrowings"
                      name="Borrowings"
                      stroke="#5fe1d3"
                      strokeWidth={3}
                      fill="url(#borrowGradient)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </section>

        <section className="mt-6 overflow-hidden rounded-[26px] bg-[#174f61] text-white shadow-[0_18px_50px_rgba(23,79,97,0.18)]">
          <div className="grid lg:grid-cols-[340px_1fr]">
            <div className="border-b border-white/10 p-6 sm:p-8 lg:border-b-0 lg:border-r">
              <div className="mb-5 grid size-11 place-items-center rounded-2xl bg-[#ffbf57] text-[#153948]">
                <IndianRupee className="size-6" aria-hidden="true" />
              </div>
              <h2 className="text-2xl font-semibold tracking-tight">
                Purchase planner
              </h2>
              <p className="mt-2 text-sm leading-6 text-[#c5dce3]">
                The model prioritizes waiting lists, demand score, and value per
                rupee.
              </p>
              <div className="mt-8">
                <div className="mb-4 flex items-end justify-between gap-4">
                  <label
                    htmlFor="budget-slider"
                    className="text-sm font-medium text-[#d6e7ec]"
                  >
                    Available budget
                  </label>
                  <output className="text-2xl font-semibold text-[#ffcd7c]">
                    {inr.format(budget)}
                  </output>
                </div>
                <Slider
                  id="budget-slider"
                  value={[budget]}
                  onValueChange={(value) => setBudget(value[0])}
                  min={3000}
                  max={20000}
                  step={500}
                  aria-label="Library book purchase budget"
                  className="[&_[data-slot=slider-range]]:bg-[#ffbf57] [&_[data-slot=slider-track]]:bg-white/20 [&_[data-slot=slider-thumb]]:border-[#ffbf57]"
                />
                <div className="mt-3 flex justify-between text-xs text-[#9dbbc6]">
                  <span>₹3,000</span>
                  <span>₹20,000</span>
                </div>
              </div>
              <div className="mt-7 rounded-2xl bg-white/8 p-4">
                <div className="flex items-center justify-between text-sm text-[#c5dce3]">
                  <span>Recommended spend</span>
                  <span className="font-semibold text-white">
                    {inr.format(recommendations.spend)}
                  </span>
                </div>
                <div className="mt-2 flex items-center justify-between text-sm text-[#c5dce3]">
                  <span>Budget remaining</span>
                  <span className="font-semibold text-[#79e4d7]">
                    {inr.format(recommendations.remaining)}
                  </span>
                </div>
              </div>
            </div>

            <div className="p-5 sm:p-8">
              <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
                <div>
                  <p className="text-sm font-medium text-[#8ce8df]">
                    Best allocation
                  </p>
                  <h3 className="mt-1 text-xl font-semibold">
                    Buy{" "}
                    {recommendations.picks.reduce(
                      (sum, book) => sum + book.quantity,
                      0,
                    )}{" "}
                    copies across {recommendations.picks.length} titles
                  </h3>
                </div>
                <Badge className="border border-white/15 bg-white/10 px-3 py-1 text-white">
                  {category}
                </Badge>
              </div>
              <div className="grid gap-3 md:grid-cols-2">
                {recommendations.picks.map((book, index) => (
                  <article
                    key={book.id}
                    className="group flex items-center gap-4 rounded-2xl border border-white/10 bg-white/[0.07] p-4 transition hover:bg-white/[0.11]"
                  >
                    <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-white/10 text-sm font-semibold text-[#ffcd7c]">
                      {String(index + 1).padStart(2, "0")}
                    </span>
                    <div className="min-w-0 flex-1">
                      <h4 className="truncate text-sm font-semibold">
                        {book.title}
                      </h4>
                      <p className="mt-1 text-xs text-[#a9c6d0]">
                        {book.quantity}{" "}
                        {book.quantity === 1 ? "copy" : "copies"} · Score{" "}
                        {book.demand}
                      </p>
                    </div>
                    <span className="text-sm font-semibold">
                      {inr.format(book.cost)}
                    </span>
                  </article>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="mt-6 rounded-[26px] border border-white bg-white shadow-[0_15px_45px_rgba(32,60,75,0.08)]">
          <div className="flex flex-col gap-4 border-b border-slate-100 p-5 sm:flex-row sm:items-end sm:justify-between sm:p-7">
            <div>
              <p className="text-sm font-semibold text-[#167d8d]">
                Collection detail
              </p>
              <h2 className="mt-1 text-2xl font-semibold tracking-tight">
                Book demand ranking
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                Showing {filteredBooks.length} of {books.length} titles
              </p>
            </div>
            {lowDemandBook && (
              <div className="flex max-w-md items-start gap-3 rounded-2xl bg-[#f1f6f8] px-4 py-3">
                <BookOpen
                  className="mt-0.5 size-4 shrink-0 text-[#167d8d]"
                  aria-hidden="true"
                />
                <p className="text-sm leading-5 text-slate-600">
                  <span className="font-semibold text-slate-800">
                    Low-demand signal:
                  </span>{" "}
                  {lowDemandBook.title} may need promotion before another copy
                  is purchased.
                </p>
              </div>
            )}
          </div>
          {filteredBooks.length ? (
            <Table>
              <TableHeader className="bg-[#f6f9fa]">
                <TableRow className="hover:bg-[#f6f9fa]">
                  <TableHead className="min-w-72 px-5 sm:px-7">
                    Book
                  </TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead className="text-center">Copies</TableHead>
                  <TableHead className="text-center">Borrowed</TableHead>
                  <TableHead className="text-center">Waiting</TableHead>
                  <TableHead className="px-5 text-right sm:px-7">
                    Demand
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredBooks.map((book) => {
                  const score = getDemandScore(book);
                  return (
                    <TableRow key={book.id}>
                      <TableCell className="px-5 py-4 sm:px-7">
                        <div className="flex items-center gap-3">
                          <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-[#eaf4f6] text-[#167d8d]">
                            <BookOpen
                              className="size-4"
                              aria-hidden="true"
                            />
                          </span>
                          <div className="min-w-0">
                            <p className="max-w-72 truncate font-semibold text-[#102533]">
                              {book.title}
                            </p>
                            <p className="mt-0.5 max-w-72 truncate text-xs text-slate-500">
                              {book.author}
                            </p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className="font-medium text-slate-600"
                        >
                          {book.category}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-center font-medium">
                        {book.copies}
                      </TableCell>
                      <TableCell className="text-center font-medium">
                        {book.borrowings}
                      </TableCell>
                      <TableCell className="text-center">
                        <span
                          className={
                            book.waiting
                              ? "font-semibold text-[#bd6500]"
                              : "text-slate-400"
                          }
                        >
                          {book.waiting}
                        </span>
                      </TableCell>
                      <TableCell className="px-5 text-right sm:px-7">
                        <Badge
                          variant="outline"
                          className={demandClasses(score)}
                        >
                          {getDemandLabel(score)} · {score}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          ) : (
            <div className="h-64">
              <EmptyState />
            </div>
          )}
        </section>

        <footer className="flex flex-col gap-3 px-2 pb-4 pt-8 text-sm text-slate-500 sm:flex-row sm:items-center sm:justify-between">
          <p>Built as a Data Science portfolio project by Aazim Ashraf.</p>
          <p className="font-semibold text-[#167d8d]">
            Open source · MIT License
          </p>
        </footer>
      </div>
    </main>
  );
}

function MetricCard({
  icon: Icon,
  label,
  value,
  note,
  accent,
  compact = false,
}: {
  icon: LucideIcon;
  label: string;
  value: string;
  note: string;
  accent: "blue" | "teal" | "amber" | "coral";
  compact?: boolean;
}) {
  const accents = {
    blue: "bg-[#e8f0ff] text-[#356dce]",
    teal: "bg-[#dff7f4] text-[#0f766e]",
    amber: "bg-[#fff0d4] text-[#ad6200]",
    coral: "bg-[#ffe9e5] text-[#bd523c]",
  };

  return (
    <Card className="gap-4 border-0 py-5 shadow-[0_12px_35px_rgba(32,60,75,0.07)]">
      <CardContent className="px-5 sm:px-6">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <p className="text-sm font-medium text-slate-500">{label}</p>
            <p
              className={
                "mt-2 font-semibold tracking-[-0.03em] text-[#102533] " +
                (compact
                  ? "line-clamp-2 min-h-14 text-xl leading-7"
                  : "text-3xl")
              }
            >
              {value}
            </p>
            <p className="mt-2 text-xs text-slate-500">{note}</p>
          </div>
          <span
            className={
              "grid size-11 shrink-0 place-items-center rounded-2xl " +
              accents[accent]
            }
          >
            <Icon className="size-5" aria-hidden="true" />
          </span>
        </div>
      </CardContent>
    </Card>
  );
}

function EmptyState() {
  return (
    <div className="grid h-full place-items-center p-8 text-center">
      <div>
        <Search
          className="mx-auto size-8 text-slate-300"
          aria-hidden="true"
        />
        <p className="mt-3 font-semibold text-slate-700">No matching books</p>
        <p className="mt-1 text-sm text-slate-500">
          Try a different title, author, or category.
        </p>
      </div>
    </div>
  );
}
