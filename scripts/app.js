var dashboard = angular.module("dashboard", []);

    dashboard.controller("myController", function($scope, $http, $interval){
        $scope.server = {};
        $scope.ArrRAM = [];
        $scope.ArrLoad = [0,20];
        $scope.RAM = {
            total:'',
            cache:'',
            buffer:'',
            free:''
        }
        $scope.feed = {};
        $scope.bytesToSize = function(bytes) {
            var sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
            
            if (bytes == 0) return 'n/a';
            var i = parseInt(Math.floor(Math.log(bytes) / Math.log(1024)));
            if (i == 0) return bytes + ' ' + sizes[i];
            
            return (bytes / Math.pow(1024, i)).toFixed(1) + ' ' + sizes[i];
        };
 
        var ctx = document.getElementById("RAMchart");
        var ctx2 = document.getElementById("Loadchart");

        var myRAMChart = new Chart(ctx, {
            type: 'doughnut',
            data: {
                datasets: [{data: $scope.ArrRAM,backgroundColor: ["#FF6384","#36A2EB","#FFCE56"]}]
            },
            options: {
              responsive: false,
              legend: {
                position:'bottom',
                labels: {
                  boxWidth: 10,
                  padding: 10
                }
              },
              tooltips: {
                enabled: true,
                callbacks:  {
                  label: function(tooltipItem, data) {
                    return data.labels[tooltipItem.index];
                  }
                }
              }
            }
          }); // end of RAM chart
        var myTimeChart = new Chart(ctx2, {
            type: 'doughnut',
            data: {
                  labels: [
                      "Load Now",
                      "Unused",
                  ],
                  datasets: [
                      {
                          data: $scope.ArrLoad,
                          backgroundColor: [
                              "#df7b3a",
                              "#c5b39b"
                          ],
                          hoverBackgroundColor: [
                              "#df7b3a",
                              "#c5b39b"
                          ]
                      }]
            },
            options: {
              responsive: false,
              legend: {
                position:'bottom',
                labels: {
                  boxWidth:20,
                  padding:30
                }                    
              },
            }
          }); //end of Load chart           
        var fetch_data = function(){
            //Change $http.get to prod url later
            $http.get('http://cloudprotection.me/t/test.php').error(function(err){
                $scope.server.kernel = "Error! unable to fetch feed data";
            }).success(function(data){
                $scope.server=data;

                $scope.RAM.total = $scope.bytesToSize(data.ramtotal);
                $scope.RAM.cache = $scope.bytesToSize(data.ramcached);
                $scope.RAM.buffer = $scope.bytesToSize(data.rambuffer);
                $scope.RAM.free = $scope.bytesToSize(data.ramfree);

                $scope.ArrRAM[0]=$scope.server.ramcached;
                $scope.ArrRAM[1]=$scope.server.rambuffer;
                $scope.ArrRAM[2]=$scope.server.ramfree;
                $scope.ArrLoad[0] = data.loadnow;
                $scope.ArrLoad[1] = 20 - data.loadnow;
                myRAMChart.data.labels = 
                  ["Cached: "+ $scope.RAM.cache, 
                   "Buffer: "+ $scope.RAM.buffer,
                   "Free: "+ $scope.RAM.free
                  ];
                myRAMChart.update();
                myTimeChart.update();
            });            
        }
        fetch_data();
        $interval(fetch_data, 10000);

    }); //end of controller