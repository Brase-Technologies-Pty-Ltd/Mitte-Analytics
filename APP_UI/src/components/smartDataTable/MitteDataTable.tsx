import React, { useState } from "react";
import "./MitteDataTable.css";
import {
  PaginationState,
  useReactTable,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  flexRender,
  getSortedRowModel,
  SortingState,
  RowData,
} from "@tanstack/react-table";
import { IoChevronBackOutline } from "react-icons/io5";
import { IoChevronForward } from "react-icons/io5";
import MitteInput from "../input/MittiInput";

declare module "@tanstack/table-core" {
  interface ColumnMeta<TData extends RowData, TValue> {
    sortable?: boolean;
    className?: string;
  }
}

interface ISmartFridgeDataTableProps {
  className?: string;
  showSortIcons?: boolean;
  data: any;
  columns: any;
  totalRows: number;
  hidePagination: boolean;
  noDataMessage?: string;
  pageSize?: number;
  pageIndex?: number;
}

const MitteDataTable = (props: ISmartFridgeDataTableProps) => {
  const { data, columns } = props;
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [searchQuery, setSearchQuery] = useState<string>("");

  const [{ pageIndex, pageSize }, setPagination] = React.useState<PaginationState>({
    pageIndex: props?.pageIndex ?? 0,
    pageSize: props.hidePagination ? 100000 : props?.pageSize ?? 10,
  });

  const pagination = React.useMemo(
    () => ({
      pageIndex,
      pageSize,
    }),
    [pageIndex, pageSize]
  );

  // Helper to flatten nested object into a string array of values
  const flattenObject = (obj: any): string[] => {
    let result: string[] = [];

    const recurse = (value: any) => {
      if (typeof value === "string") {
        result.push(value.toLowerCase());
      } else if (typeof value === "object" && value !== null) {
        Object.values(value).forEach(recurse);
      }
    };

    recurse(obj);
    return result;
  };

  // Apply filtering to data
  const filteredData = React.useMemo(() => {
    if (!searchQuery) return data;
    const lowerQuery = searchQuery.toLowerCase();

    return data.filter((row: any) => {
      const flattenedValues = flattenObject(row);
      return flattenedValues.some((value) => value.includes(lowerQuery));
    });
  }, [data, searchQuery]);


  const table = useReactTable({
    data: filteredData,
    columns: columns,
    state: {
      pagination,
      sorting,
    },
    onPaginationChange: setPagination,
    onSortingChange: setSorting,
    getSortedRowModel: getSortedRowModel(),
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    debugTable: true,
  });

  return (
    <>
      <MitteInput
        label=""
        name="email"
        placeholder="Search"
        required
        onChange={(e: any) => setSearchQuery(e.target.value)}
        style={{ marginBottom: "5px", border: "none", borderRadius: "0", borderBottom: "2px solid #3498db", maxWidth: "20%" }}

      />
      <div className="smart-fridge-table row">
        <table className={props.className}>
          <thead>
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <th
                    key={header.id}
                    colSpan={header.colSpan}
                    className={header.column.columnDef.meta?.className ?? ""}
                  >
                    {header.isPlaceholder ? null : (
                      <div
                        className={
                          header.column.columnDef.enableSorting
                            ? "cursor-pointer select-Data"
                            : ""
                        }
                        onClick={
                          header.column.columnDef.enableSorting
                            ? header.column.getToggleSortingHandler()
                            : undefined
                        }
                      >
                        {flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                        {props.showSortIcons &&
                          header.column.columnDef.enableSorting && (
                            {
                              asc: (
                                <span className="sort-single-icon-grid">
                                  <i className="fa fa-caret-up sort-icon-fa"></i>
                                </span>
                              ),
                              desc: (
                                <span className="sort-single-icon-grid">
                                  <i className="fa fa-caret-down sort-icon-fa"></i>
                                </span>
                              ),
                              undefined: (
                                <span className="sort-single-icon-grid">
                                  <i className="fa fa-caret-up sort-icon-fa sort-icon-inactive"></i>
                                  <i className="fa fa-caret-down sort-icon-fa sort-icon-inactive"></i>
                                </span>
                              ),
                            }[header.column.getIsSorted() as string] ?? (
                              <span className="sort-single-icon-grid">
                                <i className="fa fa-caret-up sort-icon-fa sort-icon-inactive"></i>
                                <i className="fa fa-caret-down sort-icon-fa sort-icon-inactive"></i>
                              </span>
                            )
                          )}
                      </div>
                    )}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody>
            {table.getRowModel().rows.map((row) => (
              <tr key={row.id}>
                {row.getVisibleCells().map((cell) => (
                  <td
                    key={cell.id}
                    className={cell.column.columnDef.meta?.className ?? ""}
                  >
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
            ))}
            {table.getRowModel().rows.length === 0 && (
              <tr>
                <td align="center" colSpan={table.getFlatHeaders().length}>
                  {props.noDataMessage ?? <span>There is no data</span>}
                </td>
              </tr>
            )}
          </tbody>
        </table>
        <div className="d-flex justify-content-end align-items-end mt-3 flex-wrap gap-2">
          {/* Rows per page */}
          <div className="d-flex align-items-center gap-2">
            <label className="form-label mb-0 fw-semibold">Rows per page:</label>
            <select
              className="form-select form-select-sm"
              style={{ width: "80px" }}
              value={pageSize}
              onChange={(e) =>
                setPagination({
                  pageIndex: 0,
                  pageSize: Number(e.target.value),
                })
              }
            >
              {[5, 10, 25, 50, 100].map((size) => (
                <option key={size} value={size}>
                  {size}
                </option>
              ))}
            </select>
          </div>

          {/* Arrow Navigation */}
          <div className="d-flex align-items-center gap-3">
            <span
              role="button"
              onClick={() => {
                if (table.getCanPreviousPage() && filteredData.length > 0) {
                  table.previousPage();
                }
              }}
              className={`text-primary fs-5 ${!table.getCanPreviousPage() || filteredData.length === 0
                ? "text-muted"
                : "cursor-pointer"
                }`}
              title="Previous"
              style={{
                cursor:
                  table.getCanPreviousPage() && filteredData.length > 0
                    ? "pointer"
                    : "not-allowed",
              }}
            >
              <IoChevronBackOutline />
            </span>

            <span
              role="button"
              onClick={() => {
                if (table.getCanNextPage() && filteredData.length > 0) {
                  table.nextPage();
                }
              }}
              className={`text-primary fs-5 ${!table.getCanNextPage() || filteredData.length === 0
                  ? "text-muted"
                  : "cursor-pointer"
                }`}
              title="Next"
              style={{
                cursor:
                  table.getCanNextPage() && filteredData.length > 0
                    ? "pointer"
                    : "not-allowed",
              }}
            >
              <IoChevronForward />
            </span>

          </div>

          {/* Range Info */}
          <div className="text-muted small">
            {pageSize * pageIndex + 1}–
            {Math.min((pageIndex + 1) * pageSize, filteredData.length)} of{" "}
            {filteredData.length}
          </div>
        </div>


      </div>
    </>
  );
};


export default MitteDataTable;
