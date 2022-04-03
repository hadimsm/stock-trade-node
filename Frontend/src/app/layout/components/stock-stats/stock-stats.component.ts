import {
  ChangeDetectorRef,
  Component,
  OnInit,
  SimpleChanges,
  ViewChild,
} from "@angular/core";
import { FormBuilder, FormGroup } from "@angular/forms";
import { PageEvent, MatPaginator } from "@angular/material/paginator";
import { MatSort } from "@angular/material/sort";
import { MatTableDataSource } from "@angular/material/table";
import moment from "moment";
import { StockApiService } from "src/app/shared/api/stock-api.service";
interface queryParams {
  start_date: string;
  end_date: string;
}

@Component({
  selector: "app-stock-stats",
  templateUrl: "./stock-stats.component.html",
  styleUrls: ["./stock-stats.component.scss"],
})
export class StockStatsComponent implements OnInit {
  stats = [];
  endpage = 20;
  step = 20;
  statsOriginal;
  pageEvent: PageEvent;
  pageSize = 10;
  pageIndex = 0;
  pageSizeOptions: number[] = [50, 75, 100, 125, 150];
  dataSource: MatTableDataSource<any>;
  displayedColumns: string[] = [
    "stock",
    "fluctuations",
    "max_rise",
    "max_fall",
    "chart",
  ];
  @ViewChild(MatSort, { static: true }) newSort: MatSort;
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;

  startDate = null;
  endDate = null;

  form: FormGroup;

  /* ------------------------------- constructor ------------------------------ */
  constructor(private fb: FormBuilder, private api: StockApiService) {}
  /* -------------------------------- ngOnInit -------------------------------- */
  ngOnInit() {
    this.form = this.fb.group({
      start_date: [],
      end_date: [],
    });

    for (const stat of this.stats) {
      stat["labels"] = [];
      for (const price of stat?.prices) {
        stat["labels"].push("");
      }
    }

    this.statsOriginal = [...this.stats];
  }

  async search() {
    const data: queryParams = this.form.getRawValue();
    console.log("data >> ", data);

    if (
      (data.start_date && data.start_date != null && data.start_date != "") ||
      (data.end_date && data.end_date != null && data.end_date != "")
    ) {
      const qparams = {
        start: moment(data.start_date).format("yyyy-MM-DD"),
        end: moment(data.end_date).format("yyyy-MM-DD"),
      };
      console.log("qparams >> ", qparams);
      this.stats = await this.api.getStockStats(qparams);
      this.generateTable();
    }
  }
  /* -------------------------------- loadMore; ------------------------------- */
  loadMore() {
    if (this.stats && this.stats.length <= this.endpage + this.step) {
      this.endpage = this.stats.length;
    } else {
      this.endpage = this.endpage + this.step;
    }
  }
  /* ------------------------------- ngOnChanges ------------------------------ */
  ngOnChanges(changes: SimpleChanges) {
    // console.log('changes ---> ', changes);
    console.log("changes ---> ", changes);

    if (changes.users) this.generateTable();
  }

  /* ------------------------------- LimitOrders ------------------------------ */
  LimitStats(event) {
    console.log(event);
    this.pageSize = event.pageSize;
    this.pageIndex = event.pageIndex;
    return event;
  }

  /* ------------------------------- applyFilter ------------------------------ */
  applyFilter(event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }

  /* --------------------------- dataTableGenerator --------------------------- */
  dataTableGenerator() {
    return new MatTableDataSource(
      this.stats.map((item) => {
        return item;
      })
    );
  }

  /* ------------------------------ generateTable ----------------------------- */
  generateTable() {
    this.dataSource = this.dataTableGenerator();
    this.dataSource.sort = this.newSort;
    this.dataSource.paginator = this.paginator;
  }
}