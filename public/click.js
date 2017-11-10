angular.module('buttons',[])
  .controller('buttonCtrl',ButtonCtrl)
  .factory('buttonApi',buttonApi)
  .constant('apiUrl','http://localhost:1337'); // CHANGED for the lab 2017!

function ButtonCtrl($scope,buttonApi){
   $scope.buttons=[]; //Initially all was still
   $scope.transaction=[];
   $scope.errorMessage='';
   $scope.isLoading=isLoading;
   $scope.refreshButtons=refreshButtons;
   $scope.buttonClick=buttonClick;
   $scope.refreshTrans=refreshTrans;
   $scope.subOne = subOne;
   $scope.total = 0.0;

   var loading = false;

   function isLoading(){
    return loading;
   }
  function refreshButtons(){
    loading=true;
    $scope.errorMessage='';
    buttonApi.getButtons()
      .success(function(data){
         $scope.buttons=data;
         loading=false;
      })
      .error(function () {
          $scope.errorMessage="Unable to load Buttons:  Database request failed";
          loading=false;
      });
 }
  function buttonClick($event){
     $scope.errorMessage='';
     buttonApi.clickButton($event.target.id)
        .success(function(){refreshTrans()})
        .error(function(){$scope.errorMessage="Unable click";});
  }
  function subOne($event, id){
	buttonApi.clickItem(id)
	.success(function(){refreshTrans()})
	.error(function(){$scope.errorMessage="Unable to remove item from transaction";});
 }

 function refreshTrans(){
	loading = true;
	buttonApi.getTrans()
		.success(function(data){
			$scope.transaction = data;
			$scope.total = $scope.transaction.reduce(
				function(n, m){ return n + m.total; }, 0.0);
			loading = false;
		}).error(function() {
			$scope.errorMessage="Failed to get transaction data";
			loading = false;
		});
 }

  refreshButtons();  //make sure the buttons are loaded
  refreshTrans();
}

function buttonApi($http,apiUrl){
  return{
    getButtons: function(){
      var url = apiUrl + '/buttons';
      return $http.get(url);
    },
    clickButton: function(id){
      var url = apiUrl+'/click?id='+id;
//      console.log("Attempting with "+url);
      return $http.get(url); // Easy enough to do this way
    },
//};};

//function transApi($http,apiURL){
//  return{
    getTrans: function(){
      var url = apiUrl + '/getTrans';
      return $http.get(url);
    },
    clickItem: function(id){
       var url = apiUrl+'/removeItem?id=' + id;
       console.log("attempting with url = " + url);
       return $http.get(url);
    }
 };
}

