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
   $scope.login = login;
   $scope.closeTrans = closeTrans;

   var loading = false;

   function isLoading(){
    return loading;
   }

   function login($event){
	
	var user = document.getElementById('user').value;
	var pass = document.getElementById('pass').value;
	
	buttonApi.login(user, pass)
	.success(function(data){
		refreshTrans();
		refreshButtons();})
	.error(function(){});
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

 function closeTrans($event, voided){
    console.log("Closing a transaction");
    buttonApi.sale($scope.total, voided).success(
        function(data){
		console.log("Successfully closed the transaction");
                refreshTrans();
                refreshButtons();
        }).error(function(){
            $scope.errorMessage="Failed to close transaction";
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
      return $http.get(url); // Easy enough to do this way
    },
    getTrans: function(){
      var url = apiUrl + '/getTrans';
      return $http.get(url);
    },
    clickItem: function(id){
       var url = apiUrl+'/removeItem?bid=' + id;
       console.log("attempting with url = " + url);
       return $http.get(url);
    },
    login: function(user, pass){
	    var url = apiUrl+'/login?user='+user+'&pass='+pass;
	    return $http.get(url);
    },
    sale: function(total, voided){
        var url = apiUrl+'/sale?total='+total+'&voided='+voided;
        return $http.get(url);
    }
 };
}
