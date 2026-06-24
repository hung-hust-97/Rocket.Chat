import { Accounts } from 'meteor/accounts-base';
import { Match, check } from 'meteor/check';
import { Meteor } from 'meteor/meteor';
import { ServiceConfiguration } from 'meteor/service-configuration';
import _ from 'underscore';

const AccessTokenServices = {};

export const registerAccessTokenService = function (serviceName, handleAccessTokenRequest) {
	AccessTokenServices[serviceName] = {
		serviceName,
		handleAccessTokenRequest,
	};
};

// Listen to calls to `login` with an oauth option set. This is where
// users actually get logged in to meteor via oauth.
Accounts.registerLoginHandler(async (options) => {
	if (!options.accessToken) {
		return undefined; // don't handle
	}

	check(
		options,
		Match.ObjectIncluding({
			serviceName: String,
		}),
	);

	const service = AccessTokenServices[options.serviceName];

	// Skip everything if there's no service set by the oauth middleware
	if (!service) {
		throw new Error(`Unexpected AccessToken service ${options.serviceName}`);
	}

	// Make sure we're configured
	if (!(await ServiceConfiguration.configurations.findOneAsync({ service: options.serviceName }))) {
		throw new Accounts.ConfigError();
	}

	if (!_.contains(Accounts.oauth.serviceNames(), service.serviceName)) {
		// serviceName was not found in the registered services list.
		// This could happen because the service never registered itself or
		// unregisterService was called on it.
		return {
			type: 'oauth',
			error: new Meteor.Error(Accounts.LoginCancelledError.numericError, `No registered oauth service found for: ${service.serviceName}`),
		};
	}

	const oauthResult = await service.handleAccessTokenRequest(options);
	const { serviceData } = oauthResult;

    // Tìm user theo email
    let user = Meteor.users.findOne({ 'emails.address': serviceData.email });

    if (user) {
        // Nếu user tồn tại, thêm Keycloak vào service
        Meteor.users.update(
            { _id: user._id },
            {
                $set: {
                    [`services.${options.serviceName}`]: serviceData,
                },
            }
        );
    } else {
        // Nếu không tồn tại, tạo user mới
        user = Accounts.updateOrCreateUserFromExternalService(
            options.serviceName,
            serviceData,
            oauthResult.options
        );
    }

    return { userId: user._id, type: options.serviceName };

	// return Accounts.updateOrCreateUserFromExternalService(service.serviceName, oauthResult.serviceData, oauthResult.options);
});
