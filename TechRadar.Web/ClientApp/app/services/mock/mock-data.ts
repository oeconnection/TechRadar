import { Quadrant, Cycle, Blip, Radar } from '../../models';

export const FUTURE_CYCLES: any = {
    'adopt': new Cycle({
        'name': 'Adopt',
        'fullName': 'Adopt',
        'order': 0,
        'description': 'Full adoption of technology recommended',
        'size': 15
    }),
    'trial': new Cycle({
        'name': 'Trial',
        'fullName': 'Trial',
        'order': 1,
        'description': 'Technology recommended to remain in non critical, trial projects',
        'size': 30
    }),
    'assess': new Cycle({
        'name': 'Assess',
        'fullName': 'Assess',
        'order': 2,
        'description': 'Technology should not be used in production projects at this time',
        'size': 30
    }),
    'hold': new Cycle({
        'name': 'Hold',
        'fullName': 'Hold',
        'order': 3,
        'description': 'Technology should not be used at this time',
        'size': 25
    })
};

export const EXISTING_CYCLES: any = {
    'supported': new Cycle({
        'name': 'Supported',
        'fullName': 'Supported',
        'order': 0,
        'description': 'Technology should be used in features.',
        'size': 15
    }),
    'aging': new Cycle({
        'name': 'Aging',
        'fullName': 'Aging, but Deprecated',
        'order': 1,
        'description': 'Technology is still supported, but deprecated so newer technologies may work better.',
        'size': 30
    }),
    'eol': new Cycle({
        'name': 'EOL',
        'fullName': 'Approaching End of Life (EOL)',
        'order': 2,
        'description': 'Approaching end of life for the technology. Alternatives should be found soon.',
        'size': 30
    }),
    'oos': new Cycle({
        'name': 'OOS',
        'fullName': 'Out of Support (OOS)',
        'order': 3,
        'description': 'Out of Support: Technology is no longer supported by creator and should not be used in new features.',
        'size': 30
    }),
    'debt': new Cycle({
        'name': 'Debt',
        'fullName': 'Technical Debt',
        'order': 4,
        'description': 'Technology debt that should not be used at this time and should be removed where possible.',
        'size': 25
    })
};

export const FUTURE_QUADRANTS: Quadrant[] = [
    new Quadrant({
        'quadrantNumber': 1, 'name': 'Tools', 'description': 'Tools', 'blips': [
            new Blip(1, 'D3', FUTURE_CYCLES.adopt),
            new Blip(2, 'Dependency Management for JavaScript', FUTURE_CYCLES.adopt, true),
            new Blip(3, 'Ansible', FUTURE_CYCLES.trial, true),
            new Blip(4, 'Calabash', FUTURE_CYCLES.trial, true),
            new Blip(5, 'Chaos Monkey', FUTURE_CYCLES.trial, true),
            new Blip(6, 'Gatling', FUTURE_CYCLES.trial),
            new Blip(7, 'Grunt.js', FUTURE_CYCLES.trial, true),
            new Blip(8, 'Hystrix', FUTURE_CYCLES.trial),
            new Blip(9, 'Icon fonts', FUTURE_CYCLES.trial),
            new Blip(10, 'Librarian-puppet and Librarian-Chef', FUTURE_CYCLES.trial),
            new Blip(11, 'Logstash & Graylog2', FUTURE_CYCLES.trial),
            new Blip(12, 'Moco', FUTURE_CYCLES.trial, true),
            new Blip(13, 'PhantomJS', FUTURE_CYCLES.trial),
            new Blip(14, 'Prototype On Paper', FUTURE_CYCLES.trial, true),
            new Blip(15, 'SnapCI', FUTURE_CYCLES.trial, true),
            new Blip(16, 'Snowplow Analytics & Piwik', FUTURE_CYCLES.trial),
            new Blip(17, 'Cloud-init', FUTURE_CYCLES.assess, true),
            new Blip(18, 'Docker', FUTURE_CYCLES.assess, true),
            new Blip(19, 'Octopus', FUTURE_CYCLES.assess),
            new Blip(20, 'Sensu', FUTURE_CYCLES.assess, true),
            new Blip(21, 'Travis for OSX/iOS', FUTURE_CYCLES.assess, true),
            new Blip(22, 'Visual regression testing tools', FUTURE_CYCLES.assess, true),
            new Blip(23, 'Xamarin', FUTURE_CYCLES.assess, true),
            new Blip(24, 'Ant', FUTURE_CYCLES.hold, true),
            new Blip(25, 'Heavyweight test tools', FUTURE_CYCLES.hold),
            new Blip(26, 'TFS', FUTURE_CYCLES.hold)
        ] }),
    new Quadrant({
        'quadrantNumber': 2, 'name': 'Techniques', 'description': 'Techniques', 'blips': [
            new Blip(27, 'Capturing client-side JavaScript errors', FUTURE_CYCLES.adopt),
            new Blip(28, 'Continuous delivery for mobile devices', FUTURE_CYCLES.adopt),
            new Blip(29, 'Mobile testing on mobile networks', FUTURE_CYCLES.adopt),
            new Blip(30, 'Segregated DOM plus node for JS Testing', FUTURE_CYCLES.adopt, true),
            new Blip(31, 'Windows infrastructure automation', FUTURE_CYCLES.adopt),
            new Blip(32, 'Capture domain events explicitily', FUTURE_CYCLES.trial, true),
            new Blip(33, 'Client and server rendering with same code', FUTURE_CYCLES.trial, true),
            new Blip(34, 'HTML5 storage instead of cookies', FUTURE_CYCLES.trial),
            new Blip(35, 'Instrument all the things', FUTURE_CYCLES.trial, true),
            new Blip(36, 'Masterless Chef/Puppet', FUTURE_CYCLES.trial, true),
            new Blip(37, 'Micro-services', FUTURE_CYCLES.trial),
            new Blip(38, 'Perimeterless enterprise', FUTURE_CYCLES.trial),
            new Blip(39, 'Provisioning testing', FUTURE_CYCLES.trial, true),
            new Blip(40, 'Structured logging', FUTURE_CYCLES.trial, true),
            new Blip(41, 'Bridging physical and digital worlds with simple hardware', FUTURE_CYCLES.assess, true),
            new Blip(42, 'Collaborative analytics and data science', FUTURE_CYCLES.assess),
            new Blip(43, 'Datensparsamkeit', FUTURE_CYCLES.assess, true),
            new Blip(44, 'Development environments in the cloud', FUTURE_CYCLES.assess),
            new Blip(45, 'Focus on mean time to recovery', FUTURE_CYCLES.assess),
            new Blip(46, 'Machine image as a build artifact', FUTURE_CYCLES.assess),
            new Blip(47, 'Tangible interaction', FUTURE_CYCLES.assess, true),
            new Blip(48, 'Cloud lift and shift', FUTURE_CYCLES.hold, true),
            new Blip(49, 'Ignoring OWASP Top 10', FUTURE_CYCLES.hold, true),
            new Blip(50, 'Siloed metrics', FUTURE_CYCLES.hold, true),
            new Blip(51, 'Velocity as productivity', FUTURE_CYCLES.hold, true)
        ] }),
    new Quadrant({
        'quadrantNumber': 3, 'name': 'Platforms', 'description': 'Platforms', 'blips': [
            new Blip(52, 'Elastic Search', FUTURE_CYCLES.adopt),
            new Blip(53, 'MongoDB', FUTURE_CYCLES.adopt),
            new Blip(54, 'Neo4J', FUTURE_CYCLES.adopt),
            new Blip(55, 'Node.js', FUTURE_CYCLES.adopt),
            new Blip(56, 'Redis', FUTURE_CYCLES.adopt),
            new Blip(57, 'SMS and USSD as UI', FUTURE_CYCLES.adopt),
            new Blip(58, 'Hadoop 2.0', FUTURE_CYCLES.trial),
            new Blip(59, 'Hadoop as a service', FUTURE_CYCLES.trial, true),
            new Blip(60, 'PostgreSQL for NoSql', FUTURE_CYCLES.trial),
            new Blip(61, 'Vumi', FUTURE_CYCLES.trial),
            new Blip(62, 'Akka', FUTURE_CYCLES.assess, true),
            new Blip(63, 'Backend as a service', FUTURE_CYCLES.assess, true),
            new Blip(64, 'Low-cost robotics', FUTURE_CYCLES.assess, true),
            new Blip(65, 'PhoneGap/Apache Cordova', FUTURE_CYCLES.assess),
            new Blip(66, 'Private Clouds', FUTURE_CYCLES.assess),
            new Blip(67, 'SPDY', FUTURE_CYCLES.assess, true),
            new Blip(68, 'Storm', FUTURE_CYCLES.assess, true),
            new Blip(69, 'Web Components standard', FUTURE_CYCLES.assess, true),
            new Blip(70, 'Open Stack', FUTURE_CYCLES.trial),
            new Blip(71, 'Big enterprise solutions', FUTURE_CYCLES.hold),
            new Blip(72, 'CMS as a platform', FUTURE_CYCLES.hold, true),
            new Blip(73, 'Enterprise Data Warehouse', FUTURE_CYCLES.hold, true)
        ] }),
    new Quadrant({
        'quadrantNumber': 4, 'name': 'Languages & Frameworks', 'description': 'Languages & Frameworks', 'blips': [
            new Blip(74, 'Clojure', FUTURE_CYCLES.adopt, true),
            new Blip(75, 'Dropwizard', FUTURE_CYCLES.adopt),
            new Blip(76, 'Scala, the good parts', FUTURE_CYCLES.adopt),
            new Blip(77, 'Sinatra', FUTURE_CYCLES.adopt),
            new Blip(78, 'CoffeeScript', FUTURE_CYCLES.trial),
            new Blip(79, 'Go language', FUTURE_CYCLES.trial, true),
            new Blip(80, 'Hive', FUTURE_CYCLES.trial, true),
            new Blip(81, 'Play Framework 2', FUTURE_CYCLES.trial),
            new Blip(82, 'Reactive Extensions across languages', FUTURE_CYCLES.trial, true),
            new Blip(83, 'Nancy', FUTURE_CYCLES.assess),
            new Blip(84, 'OWIN', FUTURE_CYCLES.assess),
            new Blip(85, 'Pester', FUTURE_CYCLES.assess, true),
            new Blip(86, 'Pointer Events', FUTURE_CYCLES.assess, true),
            new Blip(87, 'Python 3', FUTURE_CYCLES.assess, true),
            new Blip(88, 'TypeScript', FUTURE_CYCLES.assess, true),
            new Blip(89, 'Yeoman', FUTURE_CYCLES.assess, true),
            new Blip(90, 'Web API', FUTURE_CYCLES.trial, true),
            new Blip(91, 'Elixir', FUTURE_CYCLES.assess, true),
            new Blip(92, 'Julia', FUTURE_CYCLES.assess, true),
            new Blip(93, 'Handwritten CSS', FUTURE_CYCLES.hold),
            new Blip(94, 'JSF', FUTURE_CYCLES.hold, true)
        ] }),
];

export const EXITING_QUADRANTS: Quadrant[] = [
    new Quadrant({
        'quadrantNumber': 1, 'name': 'Tools', 'description': 'The Tools quadrant contains the software products used to help the development process.', 'blips': [
            new Blip(1, 'TFS', EXISTING_CYCLES.supported, false, 'Microsoft Team Foundation Services is a server that houses code and does builds. ', 4),
            new Blip(2, 'Artifactory', EXISTING_CYCLES.aging, true, '', 3),
            new Blip(3, 'APIGEE', EXISTING_CYCLES.supported, true, '', 3)
        ]
    }),
    new Quadrant({
        'quadrantNumber': 2, 'name': 'Techniques', 'description': 'Techniques', 'blips': [
            new Blip(4, 'Remoting', EXISTING_CYCLES.debt, false, '', 2),
            new Blip(5, 'REST API', EXISTING_CYCLES.supported, true, '', 2)
        ]
    }),
    new Quadrant({
        'quadrantNumber': 3, 'name': 'Platforms', 'description': 'Platforms', 'blips': [
            new Blip(6, 'SQL Server 2005', EXISTING_CYCLES.oos, false, '', 2),
            new Blip(7, 'SQL Server 2008', EXISTING_CYCLES.eol, true, '', 2),
            new Blip(8, 'SQL Server 2012', EXISTING_CYCLES.supported, false, '', 2),
            new Blip(9, 'Redis', EXISTING_CYCLES.supported, false, '', 2),
            new Blip(10, 'MongoDB', EXISTING_CYCLES.supported, true, '', 2)
        ]
    }),
    new Quadrant({
        'quadrantNumber': 4, 'name': 'Languages & Frameworks', 'description': 'Languages & Frameworks', 'blips': [
            new Blip(11, 'Visual Basic', EXISTING_CYCLES.debt, false, '', 1),
            new Blip(12, 'JAVA', EXISTING_CYCLES.supported, true, '', 1),
            new Blip(13, 'ASP', EXISTING_CYCLES.debt, false, '', 1),
            new Blip(14, 'C#', EXISTING_CYCLES.supported, true, '', 5),
            new Blip(15, 'ASP.NET', EXISTING_CYCLES.supported, false, '', 5),
            new Blip(16, 'Javascript', EXISTING_CYCLES.supported, false, '', 5),
            new Blip(17, 'AngularJS', EXISTING_CYCLES.aging, false, '', 2),
        ]
    }),
];

export const RADARS: Radar[] = [
    new Radar(
        'future',
        'Future Technologies',
        'Details around the technologies that the teams are researching for use at OEC.',
        FUTURE_QUADRANTS
        ),
    new Radar(
        'existing',
        'Existing Technologies',
        'Details around the technologies in use at OEC and the point into their lifecycle.',
        EXITING_QUADRANTS
        )
];
