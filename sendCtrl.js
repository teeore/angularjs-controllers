'use strict';

/**
 * @ngdoc function
 * @name studiocdnWebApp.controller:SendCtrl
 * @description
 * # NewCtrl
 * Controller of the sendPackageApp
 */
angular.module('sendPackageApp')
    .config(function($tooltipProvider) {
        angular.extend($tooltipProvider.defaults, {
            html: true,
            placement: 'bottom'
        });
    })

.config(function($timepickerProvider) {
    angular.extend($timepickerProvider.defaults, {
        length: 7
    });
})

.controller('SendCtrl', ['$scope', '$rootScope', '$window', '$timeout', 'draftSvc', 'distributionSvc', 'cacheWrapperSvc', 'fileService', 'userSvc', 'packageSvc',
    function($scope, $rootScope, $window, $timeout, draftSvc, distributionSvc, cacheWrapperSvc, fileSvc, userSvc, packageSvc) {

        $scope.isDisabled = true;
        $scope.hideMainColumn = false;
        $scope.scheduleOn = false;

        $scope.draftSelected = function(draftUrl) {
            draftSvc.resourceLocation = draftUrl;
            $window.location.reload();
        };

        draftSvc.reloadDraft(draftSvc.resourceLocation).then(function() {
            $rootScope.$broadcast('rootScope:updateUI', true);
        });

        $scope.$on('asset_list_changed', function() {
            setTimeout(function() {
                $scope.resizeElem();
            }, 100);
        });


        $rootScope.$on('rootScope:updateUI', function() {
            $scope.recReceived = false;
            $scope.linkIncluded = false;
            $scope.assetReceived = false;
            $scope.sendBtnValidate();
            $scope.validatePage();
        });


        $scope.sendBtnValidate = function() {
            $rootScope.$on('rootScope:recipientChange', function(event, data) {
                if ((data === 0)) {
                    $scope.recReceived = false;
                } else {
                    $scope.recReceived = true;
                }
            });

            $scope.$on('asset_list_changed', function() {
                if ($rootScope.filesLength === 0) {
                    $scope.assetReceived = false;
                } else {
                    $scope.assetReceived = true;
                }
            });

            $scope.$on('editorPaste', function(evt, success) {
                if (success) {
                    $scope.linkIncluded = true;
                } else {
                    $scope.linkIncluded = false;
                }
                $timeout(function() {
                    $scope.$apply();
                });

            });

            $rootScope.$on('subjectEmpty', function(evt, success) {
                if (success) {
                    $scope.subjReceived = false;
                } else {
                    $scope.subjReceived = true;
                }
            });
        };

        $scope.validatePage = function() {
            if ($scope.recReceived && $scope.subjReceived && $scope.linkIncluded && $scope.assetReceived) {
                $scope.isDisabled = false;
                return 'all-btns';
            } else {
                $scope.isDisabled = true;

                return 'disabled-btn';
            }
        };

        $scope.sendAs = function(selectedSender) {
            draftSvc.updateSendAsSender(selectedSender);
        };

        // date/time picker controller

        $scope.time = new Date();
        $scope.sharedDate = new Date(new Date().setMinutes(0));
        $scope.resetDateTime = function() {
            $scope.sharedDate = new Date(new Date().setMinutes(0));
            $scope.time = new Date();
            $scope.scheduleOn = false;
            $scope.showTime = false;
        };
        $scope.dateTimeChange = function() {
            $scope.scheduleOn = true;
        };
    }
]);
