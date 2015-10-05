'use strict';
angular.module('packageApp')
    .controller('PackageCtrl', ['$scope', '$timeout', '$location', '$window', '$state', 'packageSvc', '$rootScope', 'draftSvc', function($scope, $timeout, $location, $state, $window, packageSvc, $rootScope, draftSvc) {
        $scope.state = $state;

        packageSvc.setAuthentication(null);
        $scope.$on('packageDetailDeleted', function(event, data) {
            $scope.packageList.splice($scope.packageList.indexOf(data), 1);
        });

        $scope.requestMorePackages = function() {
            packageSvc.withSearchQuery = $scope.searchquery;
            packageSvc.getMorePackages().then(function(result) {
                packageSvc.appendToDraftList(result.data);
                $scope.packageList = packageSvc.draftList;
            });
        };

        $scope.resetPackagesNext = function() {
            packageSvc.nextIndex = null;
            packageSvc.draftList = null;
            packageSvc.withSearchQuery = $scope.searchquery;
            packageSvc.getMorePackages().then(function(result) {
                packageSvc.setDraftList(result.data);
                $scope.packageList = packageSvc.draftList;
            });
        };


        $scope.synchronizeWithServer();

        $scope.filters = ['All', 'Active', 'Drafts', 'Expired', 'Scheduled'];

        $scope.draftSelected = function(draftUrl) {
            draftSvc.draft = null;
            draftSvc.resourceLocation = draftUrl;
        };
    }])

.filter('expiredFilter', ['packageSvc', function(packageSvc) {
        return function(items) {
            var pkgStatus = packageSvc.setFilter;
            var filtered = [];
            if (items) {
                for (var i = 0; i < items.length; i++) {
                    var item = items[i];
                    if ((item.pkgStatus.toLowerCase() === 'recalled') || (item.pkgStatus.toLowerCase() === 'expired')) {
                        filtered.push(item);
                    }
                }
                return filtered;
            }

        };
    }])
    .filter('activeFilter', ['packageSvc', function(packageSvc) {
        return function(items) {
            var pkgStatus = packageSvc.setFilter;
            var filtered = [];
            if (items) {
                for (var i = 0; i < items.length; i++) {
                    var item = items[i];
                    if ((item.pkgStatus.toLowerCase() === 'active') || (item.pkgStatus.toLowerCase() === 'uploading') || (item.pkgStatus.toLowerCase() === 'preparing') || (item.pkgStatus.toLowerCase() === 'verifying')) {
                        filtered.push(item);
                    }
                }
                return filtered;
            }
        };
    }])
    .filter('draftFilter', ['packageSvc', function(packageSvc) {
        return function(items) {
            var pkgStatus = packageSvc.setFilter;
            var filtered = [];
            if (items) {
                for (var i = 0; i < items.length; i++) {
                    var item = items[i];
                    if (item.pkgStatus.toLowerCase() === 'draft') {
                        filtered.push(item);
                    }
                }
                return filtered;
            }
        };
    }])
    .filter('scheduledFilter', ['packageSvc', function(packageSvc) {
        return function(items) {
            var pkgStatus = packageSvc.setFilter;
            var filtered = [];
            if (items) {
                for (var i = 0; i < items.length; i++) {
                    var item = items[i];
                    if (item.pkgStatus.toLowerCase() === 'scheduled') {
                        filtered.push(item);
                    }
                }
                return filtered;
            }
        };
    }]);
