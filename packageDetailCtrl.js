'use strict';
angular.module('packageDetailApp')
    .controller('PackageDetailCtrl', ['$scope', '$rootScope', 'packageDetailSvc', 'draftSvc', 'mailboxSvc', 'Base64',
        function($scope, $rootScope, packageDetailSvc, draftSvc, mailboxSvc, Base64) {

            $scope.distribution = {};

            if (draftSvc.resourceLocation) {
                packageDetailSvc.distResource = draftSvc.resourceLocation;
            }

            $scope.distResource = packageDetailSvc.distResource;

            function load() {
                packageDetailSvc.loadDistributionDetail(function(callForResult) {
                    callForResult.then(function(result) {
                        // process result
                        packageDetailSvc.processResults(result);
                        // asign service object to scope object
                        $scope.distribution = packageDetailSvc.distribution;

                        if ($scope.distribution.status.state === 'SCHEDULED' || $scope.distribution.status.state === 'COMPLETE') {
                            $scope.distribution.status.state = 'active';
                        }
                    });
                });
            }

            load();

            $scope.activitySelected = function(recipientUrl) {
                if (recipientUrl) {
                    packageDetailSvc.recipResource = recipientUrl;
                }
            };

            $scope.goBack = function() {
                window.history.back();
            };

        }
    ]);
