(function() {
	return {
		currAttempt : 0,
		MAX_ATTEMPTS : 20,
		events: {
			'app.activated':'init',
			'fullUserData.done': 'handleUserResults',
			'requiredProperties.ready': 'getUserData'
		},
		requiredProperties : [
			'ticket.requester.email'
		],
		requests: {
			fullUserData: function(userID) {
				return {
					url: '/api/v2/users/' + userID + '/tickets/requested.json?sort_order=desc',
					dataType: 'json'
				};
      }
		},
		init: function(){
			this.allRequiredPropertiesExist();
		},
		getUserData: function() {
			this.ajax( 'fullUserData', this.ticket().requester().id() );
		},
		handleUserResults: function(data) {
			var lastestFive = _.first(data.tickets, 5).sort(function(a,b) { 
				var aID = a.id;
				var bID = b.id;
				return (aID === bID) ? 0 : (aID < bID) ? 1 : -1;
			});
			this.switchTo('lastfive', {
				lastestFiveArr: lastestFive
			});
		},
		allRequiredPropertiesExist: function() {
			if (this.requiredProperties.length > 0) {
				var valid = this.validateRequiredProperty(this.requiredProperties[0]);
				// prop is valid, remove from array
				if (valid) {
					this.requiredProperties.shift();
				}
				if (this.requiredProperties.length > 0 && this.currAttempt < this.MAX_ATTEMPTS) {
					if (!valid) {
						++this.currAttempt;
					}
					_.delay(_.bind(this.allRequiredPropertiesExist, this), 100);
					return;
				}
			}
			if (this.currAttempt < this.MAX_ATTEMPTS) {
				this.trigger('requiredProperties.ready');
			} else {
				services.notify(this.I18n.t('global.error.data'), 'error');
			}
		},
    objectAt: function(path) {
      return _.inject( path.split('.'), function(self, segment) {
        console.log(self);
        if (self == null) { return false; }
        return self[segment];
      }, this);
    },
    validateRequiredProperty: function(propertyPath) {
      return this.objectAt(propertyPath) != null;
    }
	};
}());