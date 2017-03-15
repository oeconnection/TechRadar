import {Component, OnInit} from '@angular/core';
import { PaginationModule } from 'ng2-bootstrap';
import { NG_TABLE_DIRECTIVES } from 'ng2-table';
import { RadarService } from '../../../services';
import { Radar, Quadrant, Cycle, ChartCycle, ChartModel, ChartBlip } from '../../../models';

@Component({
    selector: '[radar-list]',
    templateUrl: './radar-list.component.html',
    providers: [RadarService]
})

export class RadarListComponent implements OnInit {
    public rows: Array<any> = [];
    public columns: Array<any> = [
        { title: 'Id', name: 'id' },
        { title: 'Name', name: 'name' },
        { title: 'Description', name: 'description', sort: false }
    ];

    private data: Array<Radar>;
    private sub: any;
    public page: number = 1;
    public itemsPerPage: number = 10;
    public maxSize: number = 5;
    public numPages: number = 1;
    public length: number = 0;

    public config: any = {
        paging: true,
        sorting: { columns: this.columns },
        filtering: { filterString: '' },
        className: ['table-striped', 'table-bordered']
    };

    public constructor(private radarService: RadarService) {
    }

    public ngOnInit(): void {
        this.sub = this.radarService.getRadarList().subscribe(data => {
            this.data = data;
            this.length = this.data.length;

            this.onChangeTable(this.config);
        });
    }

    public changePage(page: any, data: Array<any> = this.data): Array<any> {
        console.log(page);
        let start = (page.page - 1) * page.itemsPerPage;
        let end = page.itemsPerPage > -1 ? (start + page.itemsPerPage) : data.length;
        return data.slice(start, end);
    }

    public changeSort(data: any, config: any): any {
        if (!config.sorting) {
            return data;
        }

        let columns = this.config.sorting.columns || [];
        let columnName: string = void 0;
        let sort: string = void 0;

        for (let i = 0; i < columns.length; i++) {
            if (columns[i].sort) {
                columnName = columns[i].name;
                sort = columns[i].sort;
            }
        }

        if (!columnName) {
            return data;
        }

        // simple sorting
        return data.sort((previous: any, current: any) => {
            if (previous[columnName] > current[columnName]) {
                return sort === 'desc' ? -1 : 1;
            } else if (previous[columnName] < current[columnName]) {
                return sort === 'asc' ? -1 : 1;
            }
            return 0;
        });
    }

    public changeFilter(data: any, config: any): any {
        if (!config.filtering) {
            return data;
        }

        let filteredData: Array<Radar>;
        if (config.filtering.columnName) {
            filteredData = data.filter((item: any) =>
                item[config.filtering.columnName].match(this.config.filtering.filterString));
        } else {
            filteredData = data;
        }

        let tempArray: Array<any> = [];
        filteredData.forEach((item: any) => {
            let flag = false;
            this.columns.forEach((column: any) => {
                if (item[column.name].toString().match(this.config.filtering.filterString)) {
                    flag = true;
                }
            });
            if (flag) {
                tempArray.push(item);
            }
        });
        filteredData = tempArray;

        return filteredData;
    }

    public onChangeTable(config: any, page: any = { page: this.page, itemsPerPage: this.itemsPerPage }): any {
        if (config.filtering) {
            Object.assign(this.config.filtering, config.filtering);
        }
        if (config.sorting) {
            Object.assign(this.config.sorting, config.sorting);
        }

        let filteredData = this.changeFilter(this.data, this.config);
        let sortedData = this.changeSort(filteredData, this.config);
        this.rows = page && config.paging ? this.changePage(page, sortedData) : sortedData;
        this.length = sortedData.length;
    }
}
