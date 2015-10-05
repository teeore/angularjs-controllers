'use strict';

/**
 * @ngdoc function
 * @name studiocdnWebApp.controller:MainCtrl
 * @description
 * # MainCtrl
 * Controller of the sendPackageApp
 */
angular.module('mainPackageApp')
    .controller('MainCtrl', ['$scope', '$rootScope', 'draftSvc', '$location', '$state', 'Base64', 'jwtAuthenticationSvc', 'userSvc', 'packageOptionsSvc', 'distributionSvc', function($scope, $rootScope, draftSvc, $location, $state, Base64, jwtAuthenticationSvc, userSvc, packageOptionsSvc, distributionSvc) {

        $rootScope.state = $state;
        $scope.isError = false;

        $scope.newPkg = function() {
            $scope.sendPackage = true;
            draftSvc.setAuthentication(null);
            draftSvc.create().then(function(result) {
                draftSvc.processResult(result);

                if (userSvc.user) {} else {
                    userSvc.init();
                }

                $rootScope.$broadcast('rootScope:updateUI', true);
            });
        };
        $scope.tabs = [{
            heading: 'Packages',
            route: 'main.packages',
            active: false
        }, {
            heading: 'Inbox',
            route: 'main.inbox',
            active: false
        }];

        $scope.setactiveTab = function() {
            if (($state.includes('main.packages')) || ($state.includes('main.detail')) || ($state.includes('main.send')) || ($state.includes('main.user-pref'))) {
                return 'tab-selected';
            } else {
                return '';
            }
        };

        $scope.go = function(route) {
            $state.go(route);
        };
        $scope.active = function(route) {
            return $state.is(route);
        };

        $rootScope.$on('$stateChangeStart', function(event, toState) {
            if (toState.name === 'main.packages') {
                event.preventDefault();
                $state.go('main.packages.All');
            }
            if (toState.name === 'main.detail') {
                event.preventDefault();
                $state.go('main.detail.list');
            }
            if ((angular.element('.back-to-top')).is(':visible')) {
                angular.element('.back-to-top').hide();
            }
        });

        //set min page widths
        $rootScope.$on('$stateChangeSuccess', function() {
            $scope.mainBody = angular.element('body');
            if ($state.includes('login')) {
                $scope.mainBody.removeClass().addClass('login-body');
            } else if ($state.includes('main.send')) {
                $scope.mainBody.removeClass().addClass('send-body');
            } else if ($state.includes('main.user-pref')) {
                $scope.mainBody.removeClass().addClass('user-pref-body');
            } else if ($state.includes('main.packages') || $state.includes('main.detail') || $state.includes('main.inbox')) {
                $scope.mainBody.removeClass().addClass('pkg-body');
            } else {
                $scope.mainBody.removeClass();
            }
        });

        // tab options
        var recall = {
            name: 'Recall',
            displayRule: true,
            execute: function(list) {
                angular.forEach(list, function(detail) {
                    if (detail.Selected) {
                        $scope.recallPackage(detail);
                    }
                });
            }
        };
        var resend = {
            name: 'Re-Send',
            displayRule: true,
            execute: function(list) {
                angular.forEach(list, function(detail) {
                    if (detail.Selected) {
                        $scope.resendPackage(detail);
                    }
                });
            }
        };
        var forwardOff = {
            name: 'Forwarding Off',
            displayRule: true,
            execute: function(list) {
                angular.forEach(list, function(detail) {
                    if (detail.Selected) {
                        $scope.cancelForwarding(detail);
                    }
                });
            }
        };
        var linkOff = {
            name: 'Link Protection Off',
            displayRule: true,
            execute: function(list) {
                angular.forEach(list, function(detail) {
                    if (detail.Selected) {
                        $scope.cancelProtection(detail);
                    }
                });
            }
        };
        var del = {
            name: 'Delete',
            displayRule: true,
            execute: function(list) {
                var items = [];
                var i = 0;
                angular.forEach(list, function(detail) {
                    if (detail.Selected) {
                        $scope.deletePackage(detail);
                        items.push(i);
                    }
                    i++;
                });

                items = items.slice().reverse();

                angular.forEach(items, function(p) {
                    list.splice(p, 1);
                });
            }
        };

        $scope.recallPackage = function(detail) {
            distributionSvc.setAuthentication(null);
            $scope.$broadcast('packageDetailRecalled', detail);
            distributionSvc.recallPackage(detail.pkgStatusHref).then(function(result) {
                if (result.data) {
                    detail.Selected = false;
                }
            }, function() {});
        };

        $scope.resendPackage = function(detail) {
            distributionSvc.setAuthentication(null);
            distributionSvc.resendPackage(detail.recipientUrl + '/resent').then(function(result) {
                if (result.data) {
                    detail.Selected = false;
                }
            }, function() {});
        };

        $scope.deletePackage = function(detail) {
            distributionSvc.setAuthentication(null);
            distributionSvc.deletePackage(detail.self).then(function(result) {
                if (result.data) {
                    detail.Selected = false;
                }
            }, function() {});
        };

        $scope.cancelForwarding = function(detail) {
            packageOptionsSvc.cancelForwarding(detail.options).then(function(result) {
                if (result.data) {
                    detail.Selected = false;
                }
            }, function() {});
        };

        $scope.cancelProtection = function(detail) {
            packageOptionsSvc.cancelProtection(detail.recipientUrl + '/options').then(function(result) {
                if (result.data) {
                    detail.Selected = false;
                }
            }, function() {});
        };

        $scope.selectAll = function(list) {
            $rootScope.tabView = true;
            $rootScope.showAllBtn = false;
            $rootScope.ShowNoneBtn = true;
            angular.forEach(list, function(detail) {
                detail.Selected = true;
            });
            if (list.length === 0) {
                $rootScope.tabView = false;
            }

        };

        $scope.deselectAll = function(list) {
            $rootScope.tabView = false;
            $rootScope.showAllBtn = true;
            $rootScope.ShowNoneBtn = false;
            angular.forEach(list, function(detail) {
                detail.Selected = false;
            });
        };

        $scope.click = function(options, list) {
            options.execute(list);
            $scope.reset(list);
        };

        $scope.goBack = function() {
            window.history.back();
        };

    }]);
