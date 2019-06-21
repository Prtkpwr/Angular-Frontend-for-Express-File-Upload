import { Component, OnInit, ElementRef, Input } from '@angular/core';
import { FileUploader } from 'ng2-file-upload/ng2-file-upload';
import { Http, Response } from '@angular/http';
import { map, filter, switchMap } from 'rxjs/operators';
declare const $: any;
declare const toastr: any;
declare const Chart: any;
declare const moment: any;

const URL = 'http://localhost:3000';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  public uploader: FileUploader = new FileUploader({ url: URL, itemAlias: 'TEMP' });

  constructor(private http: Http, private el: ElementRef) { }
  mychart;
  labelsVal = []
  dataVal = [];
  currentPage = 1;
  ngOnInit() {
    this.uploader.onAfterAddingFile = (file) => { file.withCredentials = false; };
    this.uploader.onCompleteItem = (item: any, response: any, status: any, headers: any) => {
      // console.log("ImageUpload:uploaded:", item, status, response, headers);
      toastr.info(item.file.name + " uploaded!")
      let data = {
        "originalFileName": item.file.name,
        "newFileName": response.split('uploads/')[1]
      }
      this.renameFiletoOriginalName(data)
      $('#fileUploadID').val("");
    };
    this.loadChart(this.currentPage, 100);
  }
  renameFiletoOriginalName(data) {
    this.http.post(URL + '/rename', data).subscribe((res) => {
      // console.log(res)
    }, (err) => {
      console.log(err)
    })
  }

  loadChart(pageNo, size) {
    this.http.get(URL + '/temp/data?pageNo=' + pageNo + '&size=' + size).subscribe((res: any) => {
      let data = JSON.parse(res._body)
      // console.log(data)
      this.labelsVal = [];
      this.dataVal = [];
      for (let x of data.data) {
        this.labelsVal.push(moment(parseInt(x.ts)).format('Do MMM YY, h:mm:ss'))
        this.dataVal.push(x.val)
      }
      if (this.mychart) {
        this.mychart.destroy()
      }
      var options = {
        type: 'line',
        data: {
          labels: this.labelsVal,
          datasets: [
            {
              label: 'temprature',
              data: this.dataVal,
              borderWidth: 1
            }
          ]
        },
        options: {
          scales: {
            yAxes: [{
              ticks: {
                reverse: false
              }
            }]
          }
        }
      }
      var ctx = document.getElementById('chartJSContainer');
      this.mychart = new Chart(ctx, options);
    }, (err) => {
      console.log(err)
    })

  }
  prevPage() {
    if (this.currentPage > 0) {
      this.currentPage--;
      this.loadChart(this.currentPage, 100);
    } else {
      return;
    }
  }
  nextPage() {
    this.currentPage++;
    if (this.currentPage > 0) {
      this.loadChart(this.currentPage, 100);
    }
  }

}
